import { Route, DataItem } from '@/types';

import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import { Context } from 'hono';

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
    const limit = Number.parseInt(ctx.req.query('limit') || '10');

    const items = await fetchArticles(limit);

    return {
        title: 'Railway articles',
        link: 'https://blog.railway.com',
        item: items,
    };
}

export const fetchArticles = async (limit: number): Promise<DataItem[]> => {
    const page = await ofetch('https://blog.railway.com/rss.xml', {
        responseType: 'text',
    });

    const $ = load(page, { xml: true });

    return Promise.all(
        $('item')
            .toArray()
            .slice(0, limit)
            .map<Promise<DataItem>>((element) => {
                const id = $(element).find('guid').text();

                return cache.tryGet(`railway:blogs:${id}`, async () => {
                    const title = $(element).find('title').text();
                    const pubDate = $(element).find('pubDate').text();
                    const link = $(element).find('link').text();

                    const { content } = await fetchArticleDetails(link);

                    return {
                        guid: id,
                        title,
                        link,
                        pubDate: parseDate(pubDate),
                        description: content,
                    } as DataItem;
                }) as Promise<DataItem>;
            })
    );
};

export const fetchArticleDetails = async (url: string) => {
    const page = await ofetch(url);
    const $ = load(page);

    const $article = $('article > section ');

    return {
        content: $article.html() ?? undefined,
    };
};
