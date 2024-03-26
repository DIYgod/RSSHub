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
    const posts = JSON.parse(raw).entities.posts;

    const list = posts.allIds.map((id) => ({
        link: baseURL + '/a/' + posts.byId[id].slug,
        title: posts.byId[id].title,
    }));
    const category = posts.byId[posts.allIds[0]].category_set[0].category.name;

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const single = await fetch(item.link);
                single.title = item.title;
                return single;
            })
        )
    );

    return {
        title: `報導者 | ${category}`,
        link: url,
        item: out,
    };
}
