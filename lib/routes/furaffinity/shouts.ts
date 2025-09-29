import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/shouts/:username',
    name: 'Shouts',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/shouts/fender',
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
            source: ['furaffinity.net/user/:username'],
            target: '/shouts/:username',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { username } = ctx.req.param();
    const url = `https://faexport.spangle.org.uk/user/${username}/shouts.json?full=1`;

    const data = await ofetch(url, {
        method: 'GET',
        headers: {
            Referer: 'https://faexport.spangle.org.uk/',
        },
    });

    const items = data.map((item) => ({
        title: `${item.name} shout at ${username}`,
        link: `https://www.furaffinity.net/user/${username}`,
        guid: item.id,
        description: `<img src="${item.avatar}"> <br> ${item.name}: ${item.text}`,
        pubDate: new Date(item.posted_at).toUTCString(),
        author: username,
    }));

    return {
        allowEmpty: true,
        title: `Fur Affinity | ${username}'s Shouts`,
        link: `https://www.furaffinity.net/user/${username}`,
        description: `Fur Affinity ${username}'s Shouts`,
        item: items,
    };
}
