import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
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
    const baseURL = 'https://www.twreporter.org';
    const url = baseURL + `/categories/${ctx.req.param('category')}`;
    const res = await got(url);
    const $ = load(res.data);

    const regexp = /^window\.__REDUX_STATE__=(.*);$/gm;
    const raw = $('script[charset="UTF-8"]').text().replaceAll(regexp, '$1');
    const list = JSON.parse(raw);

    const ids = list.entities.posts.allIds;
    const links = [];
    const titles = [];
    const category = list.entities.posts.byId[ids[0]].category_set[0].category.name;

    for (const id of ids) {
        links.push(baseURL + '/a/' + list.entities.posts.byId[id].slug);
        titles.push(list.entities.posts.byId[id].title);
    }

    const out = await Promise.all(
        links.map((item, index) => {
            const title = titles[index];
            return cache.tryGet(item, async () => {
                const single = await fetch(item);
                single.title = title;
                return single;
            });
        })
    );

    return {
        title: `報導者 | ${category}`,
        link: url,
        item: out,
    };
}
