import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { getArtwork } from './utils';

export const route: Route = {
    path: '/browse/:mode?',
    name: 'Browse',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/browse/nsfw',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: { mode: 'R18 content toggle, default value is sfw, options are sfw, nsfw' },
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
            target: '/browse',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { mode = 'sfw' } = ctx.req.param();
    if (!['sfw', 'nsfw'].includes(mode)) {
        throw new InvalidParameterError('mode must be sfw or nsfw.');
    }
    let url = 'https://faexport.spangle.org.uk/browse.json?sfw=1';
    if (mode === 'nsfw') {
        url = 'https://faexport.spangle.org.uk/browse.json';
    }

    const data = await getArtwork(url, 'https://www.furaffinity.net/browse/', mode);

    const items = data.map((item) => ({
        title: item.title,
        link: item.link,
        guid: item.id,
        description: `<img src="${item.thumbnail}">`,
        // 由于源API未提供日期，故无pubDate
        author: item.name,
    }));

    return {
        title: 'Fur Affinity | Browse',
        link: 'https://www.furaffinity.net/browse/',
        description: 'Fur Affinity Browsing Artwork',
        item: items,
    };
}
