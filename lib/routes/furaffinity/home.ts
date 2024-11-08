import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/home/:category/:mode?',
    name: 'Home',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/home/nsfw',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: {
        category: 'Category, default value is artwork, options are artwork, writing, music, crafts',
        mode: 'R18 content toggle, default value is sfw, options are sfw, nsfw',
    },
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
            target: '/',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { category = 'artwork', mode = 'sfw' } = ctx.req.param();
    let url = 'https://faexport.spangle.org.uk/home.json?sfw=1';
    if (mode === 'nsfw') {
        url = 'https://faexport.spangle.org.uk/home.json';
    }

    const data = await ofetch(url, {
        method: 'GET',
        headers: {
            Referer: 'https://faexport.spangle.org.uk/',
        },
    });

    let dataSelect;

    switch (category) {
        case 'artwork':
            dataSelect = data.artwork;
            break;
        case 'writing':
            dataSelect = data.writing;
            break;
        case 'music':
            dataSelect = data.music;
            break;
        case 'crafts':
            dataSelect = data.crafts;
            break;
        default:
            dataSelect = data.artwork;
    }

    const items = dataSelect.map((item) => ({
        title: item.title,
        link: item.link,
        guid: item.id,
        description: `<img src="${item.thumbnail}">`,
        // 由于源API未提供日期，故无pubDate
        author: item.name,
    }));

    return {
        title: 'Fur Affinity | Home',
        link: 'https://www.furaffinity.net/',
        description: `Fur Affinity Index`,
        item: items,
    };
}
