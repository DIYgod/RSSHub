import { Route } from '@/types';
import { rootUrl, apiRootUrl, processItems, icon, image } from './util';

export const route: Route = {
    path: '/news',
    categories: ['new-media', 'popular'],
    example: '/foresightnews/news',
    parameters: {},
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
            source: ['foresightnews.pro/news', 'foresightnews.pro/'],
        },
    ],
    name: '快讯',
    maintainers: ['nczitzk'],
    handler,
    url: 'foresightnews.pro/news',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const apiUrl = new URL('v1/news', apiRootUrl).href;
    const currentUrl = new URL('news', rootUrl).href;

    const { items } = await processItems(apiUrl, limit);

    return {
        item: items,
        title: 'Foresight News - 快讯',
        link: currentUrl,
        description: '快讯 - Foresight News',
        language: 'zh-cn',
        image,
        icon,
        logo: icon,
        subtitle: '快讯',
        author: 'Foresight News',
    };
}
