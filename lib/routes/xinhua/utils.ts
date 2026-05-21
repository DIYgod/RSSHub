import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

type XinhuaChineseRouteConfig = {
    path: string;
    name: string;
    example: string;
    source: string;
    title: string;
    description: string;
    section: string;
};

const rootUrl = 'https://www.news.cn';

const commonHeaders = {
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    referer: rootUrl,
};

export function createXinhuaChineseRoute(config: XinhuaChineseRouteConfig): Route {
    return {
        path: config.path,
        name: config.name,
        maintainers: ['maxlixiang'],
        example: config.example,
        categories: ['traditional-media'],
        url: config.source,
        handler: async (ctx) => {
            const limit = getLimit(ctx);
            const response = await got(config.source, {
                headers: commonHeaders,
            });
            const $ = cheerio.load(response.data);
            const items = collectItems($, config.source, config.section).slice(0, limit);

            if (!items.length) {
                throw new Error(`Could not find any Xinhua ${config.section} news items. Selector might be outdated.`);
            }

            return {
                title: config.title,
                link: config.source,
                description: config.description,
                item: items,
            };
        },
    };
}

function collectItems($: cheerio.CheerioAPI, source: string, section: string) {
    const seen = new Set<string>();

    return $('a[href]')
        .toArray()
        .map((element) => {
            const anchor = $(element);
            const href = anchor.attr('href');
            const title = normalizeText(anchor.text());

            if (!href || !title) {
                return;
            }

            const itemLink = new URL(href, source).toString();

            if (!isArticleLink(itemLink, section) || seen.has(itemLink)) {
                return;
            }

            seen.add(itemLink);

            return {
                title,
                link: itemLink,
                guid: itemLink,
                description: buildDescription(title, findImage(anchor, source)),
                pubDate: parseDateFromUrl(itemLink),
            };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function isArticleLink(itemLink: string, section: string) {
    const url = new URL(itemLink);

    return url.hostname.endsWith('news.cn') && new RegExp(`/${section}/\\d{8}/.+/c\\.html$`).test(url.pathname);
}

function parseDateFromUrl(itemLink: string) {
    const match = /\/(\d{4})(\d{2})(\d{2})\//.exec(itemLink);

    if (!match) {
        return;
    }

    const [, year, month, day] = match;
    return parseDate(`${year}-${month}-${day}`);
}

function findImage(anchor: cheerio.Cheerio<any>, source: string) {
    const image = anchor.find('img').first().attr('src') || anchor.closest('div, li, article').find('img').first().attr('src');

    if (!image) {
        return;
    }

    return new URL(image, source).toString();
}

function buildDescription(title: string, image?: string) {
    const parts = [];

    if (image) {
        parts.push(`<p><img src="${escapeAttribute(image)}" referrerpolicy="no-referrer"></p>`);
    }

    parts.push(`<p>${escapeHtml(title)}</p>`);

    return parts.join('\n');
}

function normalizeText(value?: string) {
    return (value ?? '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value: string) {
    return escapeHtml(value).replace(/"/g, '&quot;');
}

function getLimit(ctx) {
    const value = ctx.req.query('limit');
    const limit = value ? Number.parseInt(value, 10) : 30;

    return Number.isFinite(limit) && limit > 0 ? limit : 30;
}
