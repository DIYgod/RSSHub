import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import loadArticle from './article';
import { SUB_NAME_PREFIX, SUB_URL } from './const';

export const route: Route = {
    path: '/category/:category',
    categories: ['picture'],
    example: '/baobua/category/network',
    parameters: { category: 'Category' },
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
            source: ['baobua.com/cat/:category'],
            target: '/category/:category',
        },
    ],
    name: 'Category',
    maintainers: ['AiraNadih'],
    handler,
    url: 'baobua.com/',
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const url = `${SUB_URL}cat/${category}/`;

    const response = await got(url);
    const $ = load(response.body);
    const itemRaw = $('.thcovering-video').toArray();

    return {
        title: `${SUB_NAME_PREFIX} - Category: ${category}`,
        link: url,
        item: await Promise.all(
            itemRaw
                .map((e) => {
                    const item = $(e);
                    let link = item.find('a').attr('href');
                    if (!link) {
                        return null;
                    }
                    if (link.startsWith('/')) {
                        link = new URL(link, SUB_URL).href;
                    }
                    return cache.tryGet(link, () => loadArticle(link));
                })
                .filter(Boolean)
        ),
    };
}
