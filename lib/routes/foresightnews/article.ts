import type { Language, Route } from '@/types';

import { apiRootUrl, icon, image, processItems, rootUrl } from './util';

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
    const apiUrl = new URL('v1/articles', apiRootUrl).href;

    const { items } = await processItems(apiUrl, ctx);

    return {
        item: items,
        title: 'Foresight News - 文章',
        link: rootUrl,
        description: '文章 - Foresight News',
        language: 'zh-CN' as const satisfies Language,
        image,
        icon,
        logo: icon,
        author: 'Foresight News',
    };
}
