import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/press-releases/:category?/:title?',
    categories: ['government'],
    example: '/treasury/press-releases',
    parameters: { category: 'Category, see below, all by default', title: 'Title keywords, empty by default' },
    name: 'Press Releases',
    maintainers: ['nczitzk'],
    handler,
    description: `Category

| Press Releases | Statements & Remarks | Readouts | Testimonies |
| -------------- | -------------------- | -------- | ----------- |
| all            | statements-remarks   | readouts | testimonies |`,
};

async function handler(ctx: Context) {
    const { category = 'all', title = '' } = ctx.req.param();

    const rootUrl = 'https://home.treasury.gov';
    const currentUrl = `${rootUrl}/news/press-releases${category === 'all' ? '' : `/${category}`}${title === '' ? '' : `?title=${title}`}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.featured-stories__headline a')
        .toArray()
        .slice(0, 10)
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}`,
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('.field--name-field-news-body').html() ?? undefined;
                item.pubDate = parseDate(content('time').attr('datetime')!);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items as DataItem[],
    };
}
