import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import fetch from './fetch-article';

export const route: Route = {
    path: '/category/:category',
    categories: ['new-media'],
    example: '/twreporter/category/world',
    parameters: { category: 'Category' },
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
            source: ['twreporter.org/:category'],
        },
    ],
    name: '分類',
    maintainers: ['emdoe'],
    handler,
    url: 'twreporter.org/',
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const url = `https://go-api.twreporter.org/v2/index_page`;
    const res = await got(url).json();
    const list = res.data[category];

    let name = list[0].category_set[0].category.name;
    let categoryID = category;
    switch (categoryID) {
        case 'photos_section':
            categoryID = 'photography';

            break;
        case 'politics_and_society':
            categoryID = categoryID.replaceAll('_', '-');
            name = '政治社會';

            break;
        default:
            break;
    }
    const home = `https://www.twreporter.org/categories/${categoryID}`;

    const out = await Promise.all(
        list.map((item) => {
            const title = item.title;
            // categoryNames = item.category_set[0].category.name;
            return cache.tryGet(item.slug, async () => {
                const single = await fetch(item.slug);
                single.title = title;
                return single;
            });
        })
    );

    return {
        title: `報導者 | ${name}`,
        link: home,
        item: out,
    };
}
