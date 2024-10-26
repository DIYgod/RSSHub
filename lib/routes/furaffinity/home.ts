import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/home/:category/:mode?',
    name: '主页',
    url: 'furaffinity.net',
    categories: ['other'],
    example: '/furaffinity/home/nsfw',
    maintainers: ['SkyNetX007'],
    parameters: {
        category: '作品类别, 默认为 artwork, 选项为 artwork, writing, music, crafts',
        mode: '是否启用R18内容, 默认为 sfw, 选项为 sfw, nsfw',
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
