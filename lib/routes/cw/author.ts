import type { Language, Route } from '@/types';

import { baseUrl, parsePage } from './utils';

export const route: Route = {
    path: '/author/:channel',
    categories: ['traditional-media'],
    example: '/cw/author/57',
    parameters: { channel: '作者 ID，可在 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cw.com.tw/author/:channel'],
        },
    ],
    name: '作者',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { $, items } = await parsePage('author', ctx);

    return {
        title: $('head title').text(),
        description: $('.authorTxt').text(),
        link: `${baseUrl}/author/${ctx.req.param('channel')}`,
        image: $('.authorPhoto img').attr('src') || `${baseUrl}/assets_new/img/fbshare.jpg'`,
        language: $('meta[property="og:locale"]').attr('content') as Language,
        item: items,
    };
}
