import type { Route } from '@/types';

import { getWatchList } from './utils';

export const route: Route = {
    path: '/watchers/:username',
    name: `User's Watcher List`,
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/watchers/fender',
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
            source: ['furaffinity.net/watchlist/to/:username'],
            target: '/watchers/:username',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { username } = ctx.req.param();
    const { users, count } = await getWatchList(username, 'to');

    const items = users.map((item) => ({
        title: item.name,
        link: item.link,
        guid: item.guid,
        description: `${username} was watched by ${item.name}${count === undefined ? '' : ` <br> Total: ${count}`}`,
        author: item.name,
    }));

    return {
        title: `Fur Affinity | Watchers of ${username}`,
        link: `https://www.furaffinity.net/watchlist/to/${username}/`,
        description: `Fur Affinity Watchers of ${username}`,
        item: items,
    };
}
