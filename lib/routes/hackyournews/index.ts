import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/hackyournews',
    radar: [
        {
            source: ['hackyournews.com/'],
            target: '',
        },
    ],
    name: 'Index',
    maintainers: ['ftiasch'],
    handler,
    url: 'hackyournews.com/',
};

async function handler() {
    const baseUrl = 'https://hackyournews.com';
    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const item = $('article.story')
        .toArray()
        .map((story) => {
            const article = $(story);
            const link = article.find('.story-actions a[href^="https://news.ycombinator.com/item?"]').attr('href');
            return {
                title: article.find('.story-title').text(),
                link,
                category: article.attr('data-category'),
                comments: Number(article.attr('data-comments')),
                upvotes: Number(article.attr('data-hn-score')),
                description: article
                    .find('.summary-block')
                    .toArray()
                    .map((block) => $(block).html())
                    .join(''),
            };
        });

    return {
        title: 'Index',
        link: baseUrl,
        item,
    };
}
