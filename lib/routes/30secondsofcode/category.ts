import { Data, Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { processList } from './utils';
export const route: Route = {
    path: '/category/:category?/:subCategory?',
    categories: ['programming'],
    example: '/category/css/interactivity',
    parameters: {
        category: {
            description: 'Main Category. For Complete list visit site "https://www.30secondsofcode.org/collections/p/1/"',
            options: [
                { value: 'js', label: 'Javascript' },
                { value: 'css', label: 'CSS' },
                { value: 'algorithm', label: 'JavaScript Algorithms' },
                { value: 'react', label: 'React' },
            ],
        },
        subCategory: {
            description: 'Filter within Category. Visit Individual Category site for subCategories',
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
            source: ['30secondsofcode.org/:category/:subCategory/', '30secondsofcode.org/:category/'],
            target: '/category/:category/:subCategory',
        },
    ],
    name: 'Category and Subcategory',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const subCategory = ctx.req.param('subCategory') ?? '';

    const rootUrl = 'https://www.30secondsofcode.org';
    const currentUrl = `${rootUrl}${category ? `/${category}` : ''}${subCategory ? `/${subCategory}` : ''}${category || subCategory ? '/p/1/' : ''}`;

    const response = await ofetch(currentUrl);
    const $ = load(response);
    const heroElement = $('section.hero');
    const heading = heroElement.find('div > h1').text();
    const description = heroElement.find('div > p').text();
    const image = heroElement.find('img').attr('src');

    const fullList = $('section.preview-list > ul > li').toArray();
    const items = await processList(fullList);
    return {
        title: heading,
        description,
        image: `${rootUrl}${image}`,
        link: rootUrl,
        item: items,
    } as Data;
}
