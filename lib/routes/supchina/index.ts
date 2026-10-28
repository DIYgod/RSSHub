import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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

    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 50;

    let items = $('item')
        .slice(0, limit)
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
                pubDate: $item.find('pubDate').text() ? parseDate($item.find('pubDate').text()) : undefined,
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

                const description = content('.post__main').html();
                if (!description) {
                    throw new Error(`Archived article content was not found: ${item.link}`);
                }

                return { description };
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
