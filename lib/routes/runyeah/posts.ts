import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    example: '/runyeah',
    radar: [
        {
            source: ['runyeah.world/'],
        },
    ],
    categories: ['sport'],
    name: '最新文章',
    maintainers: ['TonyRL'],
    handler,
    url: 'runyeah.world/',
};

async function handler(ctx: Context) {
    const baseUrl = 'https://runyeah.world';
    const response = await parser.parseURL(`${baseUrl}/rss.xml`);
    const limit = getRouteLimit(ctx, 30);
    const list: Array<DataItem & { link: string }> = response.items.slice(0, limit).flatMap((item) => {
        if (!item.link || !item.title) {
            return [];
        }
        const date = item.isoDate || item.pubDate;
        return {
            title: item.title,
            link: item.link,
            pubDate: date ? parseDate(date) : undefined,
            author: item.creator,
            category: item.categories,
        };
    });
    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            description: await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.body);
                const body = $('article .article-content[itemprop="articleBody"]');
                if (!body.length) {
                    throw new Error('Runyeah article body is missing');
                }
                return body.html();
            }),
        }),
        { concurrency: 3 }
    );

    return {
        title: '最新文章 - 跑野大爆炸',
        link: baseUrl,
        item: items,
    };
}
