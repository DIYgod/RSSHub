import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const baseUrl = 'https://lancedb.com';
    const url = category ? `${baseUrl}/blog/category/${category}` : `${baseUrl}/blog`;
    const response = await ofetch(url);
    const $ = load(response);

    const items = $('article')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const title = $el.find('h2 a').text().trim();
            const link = $el.find('h2 a').attr('href');

            const description = $el.find('p.post-description').text().trim();
            const meta = $el.find('.post-meta').text().trim().replaceAll(/\s+/g, ' ');
            const [cat, author, dateStr] = meta.split(' / ');
            const pubDate = dateStr ? parseDate(dateStr) : undefined;

            return {
                title,
                link,
                description,
                pubDate,
                author,
                category: cat ? [cat] : [],
            };
        });

    return {
        title: `LanceDB Blog${category ? ` - ${category}` : ''}`,
        link: url,
        item: items,
    };
};

export const route: Route = {
    path: '/blog/:category?',
    name: 'Blog',
    url: 'lancedb.com/blog',
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
            target: '/blog/:category',
        },
    ],
    view: ViewType.Articles,
    handler,
};
