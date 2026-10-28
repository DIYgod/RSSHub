import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const baseUrl = 'https://lancedb.com';
    const url = category ? `${baseUrl}/blog/category/${encodeURIComponent(category)}` : `${baseUrl}/blog`;
    const response = await ofetch.raw(url, { responseType: 'text' });
    const currentUrl = response.url || url;
    const $ = load(response._data ?? '');
    const links = new Set<string>();

    const items = $('.blog_item-big, .blog_item')
        .toArray()
        .flatMap((el) => {
            const $el = $(el);
            const href = $el.find('.blog_item-link').attr('href');
            const title = $el.find('.blog-item-title').text();
            if (!href || !title) {
                return [];
            }
            const link = new URL(href, currentUrl).href;
            if (links.has(link)) {
                return [];
            }
            links.add(link);
            const dateStr = $el.find('.blog_author-and-date > div').last().text();

            return {
                title,
                link,
                description: $el.find('.blog_item-description').text(),
                pubDate: dateStr ? parseDate(`${dateStr} GMT`) : undefined,
                author: $el
                    .find('.blog-item-author')
                    .toArray()
                    .map((author) => $(author).text())
                    .join(', '),
                category: $el
                    .find('.blog-category-tag')
                    .toArray()
                    .map((tag) => $(tag).text())
                    .filter(Boolean),
            };
        });

    return {
        title: `LanceDB Blog${category ? ` - ${category}` : ''}`,
        link: currentUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/blog/:category?',
    name: 'Blog',
    url: 'www.lancedb.com/blog',
    maintainers: ['HUSTERGS'],
    example: '/lancedb/blog',
    parameters: {
        category: 'filter blog post by category, return all posts if not specified',
    },
    description: undefined,
    categories: ['programming'],
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
            source: ['lancedb.com/blog', 'lancedb.com/blog/category/:category'],
            target: '/blog/:category?',
        },
        {
            source: ['www.lancedb.com/blog', 'www.lancedb.com/category/:category'],
            target: '/blog/:category?',
        },
    ],
    view: ViewType.Articles,
    handler,
};
