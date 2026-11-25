import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/supchina',
    radar: [
        {
            source: ['supchina.com/feed', 'supchina.com/'],
            target: '',
        },
        {
            source: ['thechinaproject.com/feed', 'thechinaproject.com/'],
            target: '',
        },
    ],
    name: 'Feed',
    maintainers: ['nczitzk'],
    handler,
    url: 'thechinaproject.com',
    description: 'The China Project, formerly SupChina, closed in November 2023. This route provides its official news archive; the latest archived post is from December 2023.',
};

async function handler(ctx) {
    const rootUrl = 'https://thechinaproject.com';
    const currentUrl = `${rootUrl}/feed/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data, { xml: true });

    let items = $('item')
        .slice(0, getRouteLimit(ctx, 50))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                guid: $item.find('guid').text(),
                title: $item.find('title').text(),
                link: $item.find('link').text(),
                author: $item.find(String.raw`dc\:creator`).text(),
                category: $item
                    .find('category')
                    .toArray()
                    .map((c) => $(c).text()),
                pubDate: parseDate($item.find('pubDate').text()),
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`supchina:news:v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.aspect-spacer, .post-recs, .author-bio, #js-reg-wrap').remove();

                return { description: content('.post__main').html() };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').first().text(),
        link: rootUrl,
        item: items,
    };
}
