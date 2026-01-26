import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://sxtykx.gov.cn';
const listPath = '/kepugonggao/';

export const route: Route = {
    path: '/kepugonggao',
    categories: ['government'],
    example: '/sxtykx/kepugonggao',
    radar: [
        {
            source: ['sxtykx.gov.cn/kepugonggao/'],
            target: '/kepugonggao',
        },
    ],
    name: '科普公告',
    maintainers: ['tdcasual'],
    handler,
    url: 'sxtykx.gov.cn/kepugonggao/',
    description: '抓取太原市科学技术协会网站「科普公告」栏目文章（仅抓取列表第一页）。',
};

function resolveUrl(url: string | undefined, rootUrl: string): string | undefined {
    if (!url) {
        return;
    }

    try {
        return new URL(url, rootUrl).href;
    } catch {
        return url;
    }
}

function makeLinksAbsolute($: CheerioAPI, element: Cheerio<Element>, rootUrl: string) {
    element.find('a[href]').each((_, a) => {
        const href = $(a).attr('href');
        const resolvedHref = resolveUrl(href, rootUrl);
        if (resolvedHref) {
            $(a).attr('href', resolvedHref);
        }
    });

    element.find('img[src]').each((_, img) => {
        const src = $(img).attr('src');
        const resolvedSrc = resolveUrl(src, rootUrl);
        if (resolvedSrc) {
            $(img).attr('src', resolvedSrc);
        }
    });
}

async function fetchItem(item: DataItem, listUrl: string): Promise<DataItem> {
    if (!item.link) {
        return item;
    }

    return cache.tryGet(item.link, async () => {
        try {
            const { data: response } = await got(item.link as string, {
                headers: {
                    Referer: listUrl,
                    'User-Agent': config.trueUA,
                },
                timeout: config.requestTimeout,
            });

            const $ = load(response);
            const info = $('.artDateTime').first().text();

            item.title = $('h1.artTitle').first().text() || item.title;
            item.author = info.match(/来源：\\s*(.*?)\\s*$/)?.[1] || undefined;

            const pubDate = info.match(/(\\d{4}-\\d{2}-\\d{2}(?:\\s+\\d{2}:\\d{2}:\\d{2})?)/)?.[1];
            item.pubDate = pubDate ? parseDate(pubDate) : item.pubDate;

            const content = $('.wz').first();
            if (content.length) {
                content.find('script').remove();
                makeLinksAbsolute($, content, baseUrl);
                item.description = content.html() ?? item.description;
            }

            return item;
        } catch {
            return item;
        }
    });
}

async function handler(ctx) {
    const limitFromQuery = Number.parseInt(ctx.req.query('limit') ?? '', 10);
    const limit = Number.isFinite(limitFromQuery) && limitFromQuery > 0 ? limitFromQuery : 10;

    const listUrl = new URL(listPath, baseUrl).href;

    const { data: response } = await got(listUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
        timeout: config.requestTimeout,
    });

    const $ = load(response);

    const items = $('.lb-txt ul li')
        .slice(0, limit)
        .toArray()
        .map((element) => {
            const item = $(element);
            const a = item.find('.lb_w1a a').first();
            const link = resolveUrl(a.attr('href'), baseUrl);
            if (!link) {
                return null;
            }

            return {
                title: a.text(),
                link,
                pubDate: item.find('.w2a').first().text() ? parseDate(item.find('.w2a').first().text()) : undefined,
            };
        })
        .filter((item): item is DataItem => Boolean(item));

    const fullItems = await pMap(items, (item) => fetchItem(item, listUrl), { concurrency: 2 });

    return {
        title: $('title').text() || '科普公告',
        link: listUrl,
        item: fullItems,
    };
}
