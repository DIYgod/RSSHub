import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { baseUrl, getItem, headers, parseList } from './utils';

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
    },
};

async function handler(ctx) {
    const { cast } = ctx.req.param();

    const response = await ofetch(`${baseUrl}/api/casts/${cast}?page=0`, {
        headers,
    });

    const list = parseList(response.videos);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => getItem(item))));

    return {
        title: `Watch ${response.cast.name} Jav Online | Japanese Adult Video - JavTrailers.com`,
        description: response.cast.castWiki?.description.replaceAll('\n', ' ') ?? `Watch ${response.cast.name} Jav video’s free, we have the largest Jav collections with high definition`,
        image: response.cast.avatar,
        link: `${baseUrl}/casts/${cast}`,
        item: items,
    };
}
