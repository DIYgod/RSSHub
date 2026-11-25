import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { getArtwork } from './utils';

export const route: Route = {
    path: '/art/:folder/:username/:mode?',
    name: 'Gallery',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/art/gallery/fender/nsfw',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: {
        username: 'Username, can find in userpage',
        folder: 'Image folders, options are gallery, scraps, favorites',
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
            source: ['furaffinity.net/gallery/:username'],
            target: '/art/gallery/:username',
        },
        {
            source: ['furaffinity.net/scraps/:username'],
            target: '/art/scraps/:username',
        },
        {
            source: ['furaffinity.net/favorites/:username'],
            target: '/art/favorites/:username',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { username, folder = 'gallery', mode = 'sfw' } = ctx.req.param();
    if (!['gallery', 'scraps', 'favorites'].includes(folder) || !['sfw', 'nsfw'].includes(mode)) {
        throw new InvalidParameterError('folder must be gallery, scraps, or favorites; mode must be sfw or nsfw.');
    }
    let url = `https://faexport.spangle.org.uk/user/${username}/${folder}.json?sfw=1&full=1`;
    if (mode === 'nsfw') {
        url = `https://faexport.spangle.org.uk/user/${username}/${folder}.json?full=1`;
    }
    const data = await getArtwork(url, `https://www.furaffinity.net/${folder}/${username}/`, mode);

    let folderName;

    switch (folder) {
        case 'gallery':
            folderName = 'Gallery';
            break;
        case 'scraps':
            folderName = 'Scraps';
            break;
        case 'favorites':
            folderName = 'Favorites';
            break;
        default:
            folderName = 'Gallery';
    }
    const items = data.map((item) => ({
        title: item.title,
        link: item.link,
        guid: item.id,
        description: `<img src="${item.thumbnail}">`,
        // 由于源API未提供日期，故无pubDate
        author: item.name,
    }));

    return {
        title: `Fur Affinity | ${folderName} of ${username}`,
        link: `https://www.furaffinity.net/${folder}/${username}`,
        description: `Fur Affinity ${folderName} of ${username}`,
        item: items,
    };
}
