import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseItems } from './utils';

export const route: Route = {
    path: '/category/:category',
    categories: ['multimedia'],
    example: '/sfmcompile/category/overwatch',
    parameters: { category: 'The category' },
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
            source: ['sfmcompile.club/category/:category/'],
            target: '/category/:category',
        },
    ],
    name: 'Category',
    maintainers: ['vector0902'],

    handler: async (ctx) => {
        const { category = 'final-fantasy' } = ctx.req.param();

        const url = `https://sfmcompile.club/category/${category}/`;
        // url = 'http://localhost:8000/cat1.html'; # local test
        const response = await ofetch(url);
        const $ = load(response);

        const items = $('.g1-collection-item')
            .toArray()
            .map((item) => parseItems($(item)));

        return {
            // channel title
            title: `SFMCompile.club category ${category}`,
            // channel link
            link: url,
            // each feed item
            item: items,
        };
    },
};
