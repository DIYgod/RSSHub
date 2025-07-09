import { Data, Route, ViewType } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { rootUrl, extractArticleLinks, fetchArticleContent } from './utils';

const categoryMap = {
    politics: '76',
    culture: '107',
    india: '105',
    world: '3554',
};

export const route: Route = {
    path: '/category/:category',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/scroll/category/india',
    parameters: {
        category: {
            description: 'Category name',
            options: [
                { value: 'politics', label: 'Politics' },
                { value: 'culture', label: 'Culture' },
                { value: 'india', label: 'India' },
                { value: 'world', label: 'World' },
            ],
        },
    },
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
            source: ['scroll.in/category/:id/:category'],
            target: '/category/:category',
        },
    ],
    name: 'Category',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(ctx: any) {
    const { category } = ctx.req.param();
    const categoryId = categoryMap[category.toLowerCase()];

    if (!categoryId) {
        throw new Error(`Invalid category: ${category}. Valid categories are: ${Object.keys(categoryMap).join(', ')}`);
    }

    const currentUrl = `${rootUrl}/category/${categoryId}/${category}`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const articleLinks = extractArticleLinks($);
    const items = await Promise.all(articleLinks.map((item) => fetchArticleContent(item)));

    return {
        title: `Scroll.in - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        description: `Stories published under ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        link: currentUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    } as Data;
}
