import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getDataItem } from './utils';

export const route: Route = {
    path: '/:category/:subCategory?',
    categories: ['traditional-media'],
    parameters: {
        category: 'category, find it in the URL',
        subCategory: 'sub-category, find it in the URL',
    },
    example: '/cfr/asia',
    name: 'News',
    maintainers: ['KarasuShin'],
    handler,
    radar: [
        {
            source: ['www.cfr.org/:category', 'www.cfr.org/:category/:subCategory'],
            target: '/:category/:subCategory?',
        },
    ],
    features: {
        antiCrawler: true,
    },
};

async function handler(ctx: Context): Promise<Data> {
    const { category, subCategory } = ctx.req.param();

    const origin = 'https://www.cfr.org';
    let link = `${origin}/${category}`;
    if (subCategory) {
        link += `/${subCategory}`;
    }
    const res = await ofetch(link);

    const $ = load(res);

    const selectorMap: {
        [key: string]: string;
    } = {
        podcasts: '.episode-content__title a',
        blog: '.card-series__content-link',
        'books-reports': '.card-article__link',
    };

    const listSelector = selectorMap[category] ?? '.card-article-large__link';

    const items = await pMap($(listSelector).toArray(), (item) => getDataItem($(item).attr('href')!), { concurrency: 5 });

    return {
        title: $('head title').text().replace(' | Council on Foreign Relations', ''),
        link,
        item: items,
    };
}
