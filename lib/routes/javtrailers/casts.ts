import type { Route } from '@/types';
import cache from '@/utils/cache';
import puppeteer from '@/utils/puppeteer';

import { baseUrl, getItem, parseList, puppeteerFetch } from './utils';

export const route: Route = {
    path: '/casts/:cast',
    categories: ['multimedia'],
    example: '/javtrailers/casts/hibiki-otsuki',
    parameters: { cast: 'Cast name, can be found in the URL of the cast page' },
    radar: [
        {
            source: ['javtrailers.com/casts/:category'],
        },
    ],
    name: 'Casts',
    maintainers: ['TonyRL'],
    url: 'javtrailers.com/casts',
    handler,
    features: {
        nsfw: true,
        requirePuppeteer: true,
    },
};

async function handler(ctx) {
    const { cast } = ctx.req.param();

    const browser = await puppeteer();
    const response = await puppeteerFetch(`${baseUrl}/api/casts/${cast}?page=0`, browser);

    const list = parseList(response.videos);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => getItem(item, browser))));

    await browser.close();

    return {
        title: `Watch ${response.cast.name} Jav Online | Japanese Adult Video - JavTrailers.com`,
        description: response.cast.castWiki?.description.replaceAll('\n', ' ') ?? `Watch ${response.cast.name} Jav video’s free, we have the largest Jav collections with high definition`,
        image: response.cast.avatar,
        link: `${baseUrl}/casts/${cast}`,
        item: items,
    };
}
