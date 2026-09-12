import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog/:sort?',
    categories: ['new-media'],
    example: '/naceweb/blog',
    parameters: { sort: 'Sort, see below, Most Recent by default' },
    name: 'Blog',
    maintainers: ['nczitzk'],
    handler,
    description: `| Most Recent | Top Rated | Most Read     |
| ----------- | --------- | ------------- |
|             | top-blogs | mostreadblogs |`,
};

async function handler(ctx: Context) {
    const { sort = '' } = ctx.req.param();

    const rootUrl = 'https://community.naceweb.org';
    const currentUrl = `${rootUrl}/browse/blogs/${sort}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.BlogTitle')
        .slice(0, 10)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const link = $item.attr('href')!;
            const split = link.split('/');

            return {
                link,
                title: $item.text(),
                pubDate: parseDate(`${split[5]}-${split[6]}-${split[7]}`),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('.blogs-block .col-md-12').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
