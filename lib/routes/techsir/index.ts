import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/techsir',
    url: 'www.techsir.com',
    name: '最新资讯',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler() {
    const baseUrl = 'https://techsir.com';

    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const $ = load(response.data);

    const list = $('.tita a[rel="bookmark"]')
        .toArray()
        .flatMap((element): Array<DataItem & { link: string }> => {
            const a = $(element);
            const href = a.attr('href');
            if (!href) {
                return [];
            }
            return [{ title: a.text(), link: new URL(href, baseUrl).href }];
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`techsir:article-content:v1:${item.link}`, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(response.data);
                const description = $('#article-content').html() || $('.kg-card-markdown').html();
                const date = $('time[itemprop="datePublished"]').attr('datetime') || $('meta[property="article:published_time"]').attr('content') || $('time.time').text();
                return {
                    description,
                    pubDate: date ? parseDateInTimezone(date, 8) : undefined,
                    author: $('[itemprop="author"]').first().text() || $('a.author').text(),
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: 'TechSir - 最新资讯',
        link: baseUrl,
        item: items,
    };
}
