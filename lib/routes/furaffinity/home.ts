import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { getArtwork } from './utils';

export const route: Route = {
    path: '/home/:category/:mode?',
    name: 'Home',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/home/artwork/nsfw',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: {
        category: 'Category, default value is artwork, options are artwork, writing, music, crafts',
        mode: 'R18 content toggle, default value is sfw, options are sfw, nsfw',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['furaffinity.net'],
            target: '/home/artwork',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { category = 'artwork', mode = 'sfw' } = ctx.req.param();
    if (!['artwork', 'writing', 'music', 'crafts'].includes(category) || !['sfw', 'nsfw'].includes(mode)) {
        throw new InvalidParameterError('category must be artwork, writing, music, or crafts; mode must be sfw or nsfw.');
    }
    let url = 'https://faexport.spangle.org.uk/home.json?sfw=1';
    if (mode === 'nsfw') {
        url = 'https://faexport.spangle.org.uk/home.json';
    }

    const data = await getArtwork(url, 'https://www.furaffinity.net/', mode, category);

    const items = data.map((item) => ({
        title: item.title,
        link: item.link,
        guid: item.id,
        description: `<img src="${item.thumbnail}">`,
        // 由于源API未提供日期，故无pubDate
        author: item.name,
    }));

    return {
        title: 'Fur Affinity | Home',
        link: 'https://www.furaffinity.net/',
        description: 'Fur Affinity Index',
        item: items,
    };
}
