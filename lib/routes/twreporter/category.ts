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
    // Some sections are inconsistent with their URLs.
    // Here we use `base` to get the right favicon
    const home = 'https://www.twreporter.org/';
    const url = `https://go-api.twreporter.org/v2/index_page`;
    const res = await got(url).json();
    const category = ctx.req.param('category');
    const list = res.data[category];
    const name = list[0].category_set[0].category.name;
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
