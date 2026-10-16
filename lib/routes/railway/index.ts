import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/railway/blog',
    url: 'blog.railway.com',
    name: 'Blog',
    maintainers: ['jihuayu'],
    handler,
};

async function handler(ctx: Context) {
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && Math.floor(requestedLimit) > 0 ? Math.floor(requestedLimit) : 10;

    const items = await fetchArticles(limit);

    return {
        title: 'Railway articles',
        language: 'en' as const,
        link: 'https://blog.railway.com',
        item: items,
    };
}

const fetchArticles = async (limit: number): Promise<DataItem[]> => {
    const page = await ofetch('https://blog.railway.com/rss.xml', {
        responseType: 'text',
    });

    const $ = load(page, { xml: true });

    const elements = $('item').toArray().slice(0, limit);
    return pMap(
        elements,
        async (element): Promise<DataItem> => {
            const id = $(element).find('guid').text();

            const title = $(element).find('title').text();
            const pubDate = $(element).find('pubDate').text();
            const link = $(element).find('link').text();

            const resolvedValue1 = await cache.tryGet(`railway:blogs:v2:${id}`, () => fetchArticleDetails(link));
            {
                const { content } = resolvedValue1;
                return {
                    guid: id,
                    title,
                    link,
                    pubDate: parseDate(pubDate),
                    description: content,
                };
            }
        },
        { concurrency: 3 }
    );
};

const fetchArticleDetails = async (url: string) => {
    const page = await ofetch(url);
    const $ = load(page);

    const $article = $('article > section ');

    return {
        content: $article.html(),
    };
};
