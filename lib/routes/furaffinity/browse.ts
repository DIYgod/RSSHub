import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/browse/:mode?',
    name: '浏览',
    url: 'furaffinity.net',
    categories: ['other'],
    example: '/furaffinity/browse/nsfw',
    maintainers: ['SkyNetX007'],
    parameters: { mode: '是否启用R18内容, 默认为 sfw, 选项为 sfw, nsfw' },
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
            source: ['furaffinity.net'],
            target: '/browse',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { mode = 'sfw' } = ctx.req.param();
    let url = 'https://faexport.spangle.org.uk/browse.json?sfw=1';
    if (mode === 'nsfw') {
        url = 'https://faexport.spangle.org.uk/browse.json';
    }

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
        description: `<img src="${item.thumbnail}">`,
        // 由于源API未提供日期，故无pubDate
        author: item.name,
    }));

    return {
        title: 'Fur Affinity | Browse',
        link: 'https://www.furaffinity.net/browse/',
        description: `Fur Affinity Browsing Artwork`,
        item: items,
    };
}
