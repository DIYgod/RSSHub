import type { Route } from '@/types';

import { getWatchList } from './utils';

export const route: Route = {
    path: '/watching/:username',
    name: `User's Watching List`,
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/watching/fender',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: { username: 'Username, can find in userpage' },
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
            source: ['furaffinity.net/watchlist/by/:username'],
            target: '/watching/:username',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { username } = ctx.req.param();
    const { users, count } = await getWatchList(username, 'by');

    const items = users.map((item) => ({
        title: item.name,
        link: item.link,
        guid: item.guid,
        description: `${username} is watching ${item.name}${count === undefined ? '' : ` <br> Total: ${count}`}`,
        author: item.name,
    }));

    return {
        title: `Fur Affinity | Users ${username} is watching`,
        link: `https://www.furaffinity.net/watchlist/by/${username}/`,
        description: `Fur Affinity Users ${username} is watching`,
        item: items,
    };
}
