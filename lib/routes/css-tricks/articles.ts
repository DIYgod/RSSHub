import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { processWithWp } from './utils';

export const route: Route = {
    path: '/articles',
    view: ViewType.Articles,
    categories: ['programming'],
    example: '/css-tricks/articles',
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
            source: ['css-tricks.com/category/articles/'],
            target: '/articles',
        },
    ],
    name: 'Articles',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    // const category = ctx.req.param('category') ?? '';
    // const subCategory = ctx.req.param('subCategory') ?? '';

    const rootUrl = 'https://css-tricks.com';
    const currentUrl = `${rootUrl}/category/articles/`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const articleCards = $('article.article-card').toArray();
    const items = await processWithWp(articleCards);
    return {
        title: 'Articles - CSS-Tricks',
        description: 'Latest Articles - CSS-Tricks',
        link: currentUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    } as Data;
}
