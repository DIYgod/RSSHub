import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';

import { baseUrl, getItem, getList, parseList } from './utils';

export const route: Route = {
    path: '/studios/:studio',
    categories: ['multimedia'],
    example: '/javtrailers/studios/s1-no-1-style',
    parameters: { studio: 'Studio name, can be found in the URL of the studio page' },
    radar: [
        {
            source: ['javtrailers.com/studios/:studio'],
            target: '/studios/:studio',
        },
    ],
    name: 'Studios',
    maintainers: ['TonyRL'],
    handler,
    features: {
        nsfw: true,
        requirePuppeteer: false,
    },
};

async function handler(ctx) {
    const { studio } = ctx.req.param();

    const response = await getList(`${baseUrl}/studios/${studio}`, 'studio');

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
        title: `${response.studio.hotDvdIds?.join(' ') ?? response.studio.name} Jav Online | Japanese Adult Video - JavTrailers.com`,
        description: 'Watch Jav made by Prestige free, with high definition, we have over 4,000 studios available for free streaming.',
        link: `${baseUrl}/studios/${studio}`,
        item: items,
    };
}
