import { Route } from '@/types';
import { rootUrl, apiRootUrl, processItems, icon, image } from './util';

export const route: Route = {
    path: '/article',
    categories: ['new-media'],
    example: '/foresightnews/article',
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
            source: ['foresightnews.pro/'],
        },
    ],
    name: '文章',
    maintainers: ['nczitzk'],
    handler,
    url: 'foresightnews.pro/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const apiUrl = new URL('v1/articles', apiRootUrl).href;

    const { items } = await processItems(apiUrl, limit);

    return {
        item: items,
        title: 'Foresight News - 文章',
        link: rootUrl,
        description: '文章 - Foresight News',
        language: 'zh-cn',
        image,
        icon,
        logo: icon,
        subtitle: '文章',
        author: 'Foresight News',
    };
}
