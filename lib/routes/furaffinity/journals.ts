import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/journals/:username',
    name: '日记',
    url: 'furaffinity.net',
    categories: ['other'],
    example: '/furaffinity/journals/fender',
    maintainers: ['SkyNetX007'],
    parameters: { username: '用户名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['furaffinity.net/journals/:username'],
            target: '/journals/:username',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { username } = ctx.req.param();
    const url = `https://faexport.spangle.org.uk/user/${username}/journals.json?full=1`;

    const data = await ofetch(url, {
        method: 'GET',
        headers: {
            Referer: 'https://faexport.spangle.org.uk/',
        },
    });

    const items = data.map((item) => ({
        title: item.title,
        link: item.link,
        guid: item.id,
        description: item.description,
        pubDate: new Date(item.posted_at).toUTCString(),
        author: username,
    }));

    return {
        allowEmpty: true,
        title: `Fur Affinity | ${username}'s Journals`,
        link: `https://www.furaffinity.net/journals/${username}`,
        description: `Fur Affinity ${username}'s Journals`,
        item: items,
    };
}
