import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/commissions/:username',
    name: '委托',
    url: 'furaffinity.net',
    categories: ['other'],
    example: '/furaffinity/commissions/fender',
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
            source: ['furaffinity.net/commissions/:username'],
            target: '/commissions/:username',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { username } = ctx.req.param();
    const url = `https://faexport.spangle.org.uk/user/${username}/commissions.json?full=1`;

    const data = await ofetch(url, {
        method: 'GET',
        headers: {
            Referer: 'https://faexport.spangle.org.uk/',
        },
    });

    const items = data.map((item) => ({
        title: item.title,
        link: item.submission.link,
        guid: item.submission.id,
        description: `${item.description} <br> <img src="${item.submission.thumbnail}">`,
        author: username,
    }));

    return {
        allowEmpty: true,
        title: `Fur Affinity | ${username}'s Commissions`,
        link: `https://www.furaffinity.net/user/${username}`,
        description: `Fur Affinity ${username}'s Commissions`,
        item: items,
    };
}
