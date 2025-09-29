import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

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
    const url = `https://faexport.spangle.org.uk/user/${username}/watching.json`;
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
    const watchingCount = dataUserInfo.watching.count;

    const items = data.map((item) => ({
        title: item,
        link: `https://www.furaffinity.net/user/${item}`,
        guid: item,
        description: `${username} is watching ${item} <br> Total: ${watchingCount}`,
        author: item,
    }));

    return {
        title: `Fur Affinity | Users ${username} is watching`,
        link: `https://www.furaffinity.net/watchlist/by/${username}/`,
        description: `Fur Affinity Users ${username} is watching`,
        item: items,
    };
}
