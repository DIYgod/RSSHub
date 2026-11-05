import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/phrack',
    name: 'Article',
    maintainers: ['CitrusIce'],
    handler,
};

async function handler(): Promise<Data> {
    const rootUrl = 'https://www.phrack.org/index_latest';
    const data = await ofetch(rootUrl);

    const $ = load(data);
    const title = $('meta[property="og:title"]').attr('content');
    const articleUrl = $('link[rel="canonical"]').attr('href');
    const article: { datePublished?: string } = JSON.parse($('script[type="application/ld+json"]').first().text() || '{}');
    if (!title) {
        throw new Error('The latest Phrack article has no title.');
    }

    return {
        title: 'phrack',
        link: rootUrl,
        description: 'phrack magazine',
        language: 'en',
        item: [
            {
                title,
                description: $('.md-article-area').html(),
                link: articleUrl ? new URL(articleUrl, rootUrl).href : rootUrl,
                pubDate: article.datePublished ? parseDate(article.datePublished) : undefined,
                author: $('meta[property="og:author"]').attr('content'),
            },
        ],
    };
}
