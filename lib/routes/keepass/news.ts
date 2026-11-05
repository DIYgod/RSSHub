import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/',
    categories: ['program-update'],
    example: '/keepass',
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://keepass.info/news/news_all.html';
    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const list = $('p > a')
        .toArray()
        .map((elem): DataItem => {
            const $elem = $(elem);
            return {
                title: $elem.find('b').text(),
                link: new URL($elem.attr('href')!, baseUrl).href,
                pubDate: parseDate($elem.next().next('small').text().split('.', 1)[0]),
            };
        })
        .slice(0, getRouteLimit(ctx, 10));

    const items = await pMap(
        list,
        async (item) => {
            if (!item.link!.startsWith('https://keepass.info/')) {
                return item;
            }
            const description = await cache.tryGet(`keepass:body:${item.link}`, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                $('.sectionheader').remove();
                $('.laytablews > tbody> tr:nth-child(1) > td:nth-child(2) > p').first().remove();

                return $('.laytablews > tbody> tr:nth-child(1) > td:nth-child(2)').html();
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link: baseUrl,
        item: items,
    };
}
