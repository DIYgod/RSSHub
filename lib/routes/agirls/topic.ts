import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { baseUrl, parseArticle } from './utils';

export const route: Route = {
    path: '/topic/:topic',
    categories: ['new-media'],
    example: '/agirls/topic/AppleWatch',
    parameters: { topic: '精选主题，可通过下方精选主题列表获得' },
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
            source: ['agirls.aotter.net/topic/:topic'],
        },
    ],
    name: '精选主题',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const topic = ctx.req.param('topic');
    const link = `${baseUrl}/topic/${topic}`;
    const response = await ofetch(link);

    const $ = load(response);
    const ldJson = JSON.parse($('script[type="application/ld+json"]').text());
    const list = $('.ag-post-item__link')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${baseUrl}${item.attr('href')}`,
            };
        });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseArticle(item))));

    return {
        title: $('head title').text(),
        link,
        description: ldJson['@graph'][0].description,
        item: items,
        language: $('html').attr('lang'),
    };
}
