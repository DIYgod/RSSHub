import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

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
    const url = `https://faexport.spangle.org.uk/user/${username}/watchers.json`;
    const data = await ofetch(url, {
        method: 'GET',
        headers: {
            Referer: 'https://faexport.spangle.org.uk/',
        },
    });

    const urlUserInfo = `https://faexport.spangle.org.uk/user/${username}.json`;
    const dataUserInfo = await ofetch(urlUserInfo, {
        method: 'GET',
        headers: {
            Referer: 'https://faexport.spangle.org.uk/',
        },
    });
    const watchersCount = dataUserInfo.watchers.count;

    const items = data.map((item) => ({
        title: item,
        link: `https://www.furaffinity.net/user/${item}`,
        guid: item,
        description: `${username} was watched by ${item} <br> Total: ${watchersCount}`,
        author: item,
    }));

    return {
        title: `Fur Affinity | Watchers of ${username}`,
        link: `https://www.furaffinity.net/watchlist/to/${username}/`,
        description: `Fur Affinity Watchers of ${username}`,
        item: items,
    };
}
