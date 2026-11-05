import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';

import { baseUrl, getItem, getList, parseList } from './utils';

export const route: Route = {
    path: '/casts/:cast',
    categories: ['multimedia'],
    example: '/javtrailers/casts/hibiki-otsuki',
    parameters: { cast: 'Cast name, can be found in the URL of the cast page' },
    radar: [
        {
            source: ['javtrailers.com/casts/:cast'],
            target: '/casts/:cast',
        },
    ],
    name: 'Casts',
    maintainers: ['TonyRL'],
    url: 'javtrailers.com/casts',
    handler,
    features: {
        nsfw: true,
        requirePuppeteer: false,
    },
};

async function handler(ctx) {
    const { cast } = ctx.req.param();

    const response = await getList(`${baseUrl}/casts/${cast}`, 'cast');

    const list = parseList(response.videos);

    const items = await pMap(
        list,
        async (item) => ({
            ...(await cache.tryGet(item.link, () => getItem(item))),
            ...item,
        }),
        { concurrency: 3 }
    );

    return {
        title: `Watch ${response.cast.name} Jav Online | Japanese Adult Video - JavTrailers.com`,
        description: response.cast.castWiki?.description.replaceAll('\n', ' ') ?? `Watch ${response.cast.name} Jav video’s free, we have the largest Jav collections with high definition`,
        image: response.cast.avatar,
        link: `${baseUrl}/casts/${cast}`,
        item: items,
    };
}
