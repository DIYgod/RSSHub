import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import { parseItems, parseList } from './utils';

export const route: Route = {
    path: '/category/:category',
    categories: ['reading'],
    example: '/literotica/category/anal-sex-stories',
    parameters: {
        category: 'Category, can be found in URL',
    },
    radar: [
        {
            source: ['literotica.com/c/:category', 'literotica.com/'],
        },
    ],
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const category = ctx.req.param('category');

    const rootUrl = 'https://www.literotica.com';
    const currentUrl = `${rootUrl}/c/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = await parseItems(parseList($, currentUrl));

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
