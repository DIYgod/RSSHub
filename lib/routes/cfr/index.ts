import type { Data, DataItem, Route } from '@/types';
import type { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
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

    let items: DataItem[] = [];

    const listSelectors = ['.card-article-large__link', '.card-article__link', '.card-series__content-link'];

    const listSelector = listSelectors.find((selector) => $(selector).length);

    if (listSelector) {
        items = await Promise.all(
            $('.card-article-large__link')
                .toArray()
                .map(async (item) => {
                    const $item = $(item);
                    const href = $item.attr('href')!;
                    return await getDataItem(href);
                })
        );
    }

    return {
        title: $('head title').text().replace(' | Council on Foreign Relations', ''),
        link,
        item: items,
    };
}
