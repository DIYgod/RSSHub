import type { Language, Route } from '@/types';

import { baseUrl, parsePage } from './utils';

export const route: Route = {
    path: '/today',
    categories: ['traditional-media'],
    example: '/cw/today',
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
            source: ['cw.com.tw/today', 'cw.com.tw/'],
        },
    ],
    name: '最新上線',
    maintainers: ['TonyRL'],
    handler,
    url: 'cw.com.tw/today',
};

async function handler(ctx) {
    const { $, items } = await parsePage('today', ctx);

    return {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        link: `${baseUrl}/today`,
        image: `${baseUrl}/assets_new/img/fbshare.jpg`,
        language: $('meta[property="og:locale"]').attr('content') as Language,
        item: items,
    };
}
