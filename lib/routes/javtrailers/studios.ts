import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { baseUrl, getItem, headers, parseList } from './utils';

export const route: Route = {
    path: '/studios/:studio',
    categories: ['multimedia'],
    example: '/javtrailers/studios/s1-no-1-style',
    parameters: { studio: 'Studio name, can be found in the URL of the studio page' },
    radar: [
        {
            source: ['javtrailers.com/studios/:category'],
        },
    ],
    name: 'Studios',
    maintainers: ['TonyRL'],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const { studio } = ctx.req.param();

    const response = await ofetch(`${baseUrl}/api/studios/${studio}?page=0`, {
        headers,
    });

    const list = parseList(response.videos);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => getItem(item))));

    return {
        title: `${response.studio.hotDvdIds?.join(' ') ?? response.studio.name} Jav Online | Japanese Adult Video - JavTrailers.com`,
        description: 'Watch Jav made by Prestige free, with high definition, we have over 4,000 studios available for free streaming.',
        link: `${baseUrl}/studios/${studio}`,
        item: items,
    };
}
