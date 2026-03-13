import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    view: ViewType.Articles,
    example: '/anthropic/blog',
    parameters: {},
    radar: [
        {
            source: ['claude.com/blog'],
        },
    ],
    name: 'Claude Blog',
    maintainers: ['zlx'],
    handler,
    url: 'claude.com/blog',
};

async function handler(ctx) {
    const baseUrl = 'https://claude.com';
    const listUrl = `${baseUrl}/blog`;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const response = await ofetch(listUrl);
    const $ = load(response);

    const list: DataItem[] = $('.blog_cms_item.w-dyn-item')
        .toArray()
        .slice(0, limit)
        .map((el) => {
            const $el = $(el);
            const title = $el.find('[fs-list-field="heading"]').text().trim();
            const href = $el.find('a.clickable_link').attr('href') ?? '';
            const dateText = $el.find('[fs-list-field="date"]').text().trim();
            const category = $el.find('[fs-list-field="category"]').text().trim();

            return {
                title,
                link: href.startsWith('http') ? href : `${baseUrl}${href}`,
                pubDate: dateText ? parseDate(dateText) : undefined,
                category: category ? [category] : [],
            };
        })
        .filter((item) => item.title && item.link);

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const res = await ofetch(item.link!);
                const $article = load(res);

                const description = $article('.blog_post_content_wrap .u-rich-text-blog').html();

                return {
                    ...item,
                    description: description || '',
                };
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Claude Blog',
        link: listUrl,
        description: 'Product news and best practices for teams building with Claude.',
        item: items,
    };
}
