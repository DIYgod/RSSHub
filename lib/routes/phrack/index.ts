import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

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
    const title = $('meta[property="og:title"]').attr('content')!;
    const articleUrl = $('link[rel="canonical"]').attr('href');
    const article = JSON.parse($('script[type="application/ld+json"]').text());

    return {
        title: 'phrack',
        link: rootUrl,
        description: 'phrack magazine',
        language: 'en',
        item: [
            {
                title,
                description: $('.md-article-area').html(),
                link: articleUrl,
                pubDate: parseDate(article.datePublished),
                author: $('meta[property="og:author"]').attr('content'),
            },
        ],
    };
}
