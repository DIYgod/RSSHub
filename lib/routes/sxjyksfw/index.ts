import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';
import { CookieJar } from 'tough-cookie';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.sxjyksfw.cn';
const cookieJar = new CookieJar();

const tabMap = {
    'gk-xk': {
        name: '普通高考&学考',
        index: 0,
    },
    'yjs-zsb': {
        name: '研究生&专升本',
        index: 1,
    },
    'dk-ck': {
        name: '对口升学&成人高考',
        index: 2,
    },
    zxks: {
        name: '自学考试',
        index: 3,
    },
    'zk-sh': {
        name: '中考&社会考试',
        index: 4,
    },
} as const;

type Tab = keyof typeof tabMap;

export const route: Route = {
    path: '/:tab?',
    categories: ['government'],
    example: '/sxjyksfw/gk-xk',
    parameters: {
        tab: {
            description: '栏目，默认为 `gk-xk`',
            options: [
                {
                    label: '普通高考&学考',
                    value: 'gk-xk',
                },
                {
                    label: '研究生&专升本',
                    value: 'yjs-zsb',
                },
                {
                    label: '对口升学&成人高考',
                    value: 'dk-ck',
                },
                {
                    label: '自学考试',
                    value: 'zxks',
                },
                {
                    label: '中考&社会考试',
                    value: 'zk-sh',
                },
            ],
        },
    },
    radar: [
        {
            source: ['www.sxjyksfw.cn/index.html'],
            target: '/',
        },
    ],
    name: '首页分类推荐',
    maintainers: ['tdcasual'],
    handler,
    url: 'www.sxjyksfw.cn/index.html',
    description: `| 普通高考&学考 | 研究生&专升本 | 对口升学&成人高考 | 自学考试 | 中考&社会考试 |
| ------------ | ------------ | ---------------- | ------ | ------------ |
| gk-xk        | yjs-zsb      | dk-ck            | zxks   | zk-sh        |`,
};

function resolveUrl(url: string | undefined, base: string): string | undefined {
    if (!url) {
        return;
    }

    try {
        return new URL(url, base).href;
    } catch {
        return url;
    }
}

function makeLinksAbsolute($: CheerioAPI, element: Cheerio<Element>, base: string) {
    element.find('a[href]').each((_, a) => {
        const href = $(a).attr('href');
        const resolvedHref = resolveUrl(href, base);
        if (resolvedHref) {
            $(a).attr('href', resolvedHref);
        }
    });

    element.find('img[src]').each((_, img) => {
        const src = $(img).attr('src');
        const resolvedSrc = resolveUrl(src, base);
        if (resolvedSrc) {
            $(img).attr('src', resolvedSrc);
        }
    });
}

function parseAuthor(infoText: string): string | undefined {
    const match = /来源[:：]\s*([^　]+?)\s*(?:　|发布时间[:：]|$)/.exec(infoText);
    return match?.[1]?.trim();
}

function parsePubDate(infoText: string): Date | undefined {
    const match = /发布时间[:：]\s*(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}:\d{2})?)/.exec(infoText);
    const pubDateText = match?.[1];
    if (!pubDateText) {
        return;
    }

    if (pubDateText.includes(':')) {
        return timezone(parseDate(pubDateText, 'YYYY-MM-DD HH:mm:ss'), +8);
    }

    return timezone(parseDate(pubDateText, 'YYYY-MM-DD'), +8);
}

function formatDownloads($: CheerioAPI): string | undefined {
    const downloads = $('.download-list a[href]')
        .toArray()
        .map((a) => {
            const href = resolveUrl($(a).attr('href'), rootUrl);
            if (!href) {
                return null;
            }

            const title = $(a).text().trim() || href;
            return {
                href,
                title,
            };
        })
        .filter((d): d is { href: string; title: string } => Boolean(d));

    if (!downloads.length) {
        return;
    }

    const itemsHtml = downloads.map((d) => `<li><a href="${d.href}">${d.title}</a></li>`).join('');
    return `<h2>附件下载</h2><ul>${itemsHtml}</ul>`;
}

async function fetchItem(item: DataItem, referer: string): Promise<DataItem> {
    if (!item.link) {
        return item;
    }

    return cache.tryGet(item.link, async () => {
        try {
            const { data: response } = await got(item.link as string, {
                headers: {
                    Referer: referer,
                    'User-Agent': config.ua,
                },
                cookieJar,
                timeout: config.requestTimeout,
            });

            const $ = load(response);

            const title = $('.news-title-h1').first().text().trim();
            if (title) {
                item.title = title;
            }

            const infoText = $('.pages-source span').first().text().trim();
            if (infoText) {
                item.author = parseAuthor(infoText) || item.author;
                item.pubDate = parsePubDate(infoText) || item.pubDate;
            }

            const content = $('.newstext').first();
            if (content.length) {
                content.find('script').remove();
                content.find('style').remove();
                makeLinksAbsolute($, content, rootUrl);

                const downloadsHtml = formatDownloads($);
                item.description = content.html() ? (downloadsHtml ? `${content.html()}${downloadsHtml}` : content.html()) : item.description;
            }

            return item;
        } catch {
            return item;
        }
    });
}

async function handler(ctx) {
    const tab = (ctx.req.param('tab') ?? 'gk-xk') as Tab;
    const tabInfo = tabMap[tab];
    if (!tabInfo) {
        throw new InvalidParameterError(`Invalid tab, supported: ${Object.keys(tabMap).join(', ')}`);
    }

    const limitFromQuery = Number.parseInt(ctx.req.query('limit') ?? '', 10);
    const limit = Number.isFinite(limitFromQuery) && limitFromQuery > 0 ? limitFromQuery : 30;

    const currentUrl = new URL('/index.html', rootUrl).href;

    const { data: response } = await got(currentUrl, {
        headers: {
            'User-Agent': config.ua,
        },
        cookieJar,
        timeout: config.requestTimeout,
    });

    const $ = load(response);

    const container = $('.classtj-news.box.whitebg.tab-num02').first();
    const sections = container.find('> #tab-content > section');
    const section = sections.eq(tabInfo.index);
    if (!section.length) {
        throw new Error('Failed to find tab section on homepage');
    }

    const items = section
        .find('.classtj-news-list ul li')
        .slice(0, limit)
        .toArray()
        .map((element) => {
            const li = $(element);
            const a = li.find('a[href]').first();
            const link = resolveUrl(a.attr('href'), rootUrl);
            if (!link) {
                return null;
            }

            const pubDateText = li.find('p').first().text().trim();
            const categoryText = li.find('span').first().text().trim();

            return {
                title: a.attr('title') || a.text().trim(),
                link,
                pubDate: pubDateText ? timezone(parseDate(pubDateText, 'YYYY-MM-DD'), +8) : undefined,
                category: categoryText ? [categoryText] : undefined,
            };
        })
        .filter((item): item is DataItem => Boolean(item));

    const fullItems = await pMap(items, (item) => fetchItem(item, currentUrl), { concurrency: 2 });

    return {
        title: `山西教育考试服务网 - ${tabInfo.name}`,
        link: currentUrl,
        item: fullItems,
    };
}
