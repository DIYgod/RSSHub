import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

function parseDecimalAttribute(value: string | undefined): number {
    const integer = value?.match(/^\s*([+-]?\d+)/)?.[1];
    return integer ? Number(integer) : NaN;
}

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
            const category = article.attr('data-category');
            return {
                title: article.find('.story-title').text(),
                link,
                category: category ? [category] : undefined,
                comments: parseDecimalAttribute(article.attr('data-comments')),
                upvotes: parseDecimalAttribute(article.attr('data-hn-score')),
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
