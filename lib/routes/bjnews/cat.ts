import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { fetchArticle } from './utils';

export const route: Route = {
    path: '/cat/:cat',
    categories: ['traditional-media'],
    example: '/bjnews/cat/depth',
    parameters: { cat: '分类, 可从URL中找到' },
    features: {},
    radar: [
        {
            source: ['www.bjnews.com.cn/:cat'],
        },
    ],
    name: '分类',
    maintainers: ['dzx-dzx'],
    handler,
    url: 'www.bjnews.com.cn',
};

async function handler(ctx) {
    const url = `https://www.bjnews.com.cn/${ctx.req.param('cat')}`;
    const res = await ofetch(url);
    const $ = load(res);
    const list = $('#waterfall-container .pin_demo > a')
        .toArray()
        .slice(0, getRouteLimit(ctx, 15))
        .map((a) => ({
            title: $(a).text(),
            link: $(a).attr('href'),
            category: $(a).parent().find('.source').text().trim(),
        }));

    const out = await pMap(list, (item) => fetchArticle(item), { concurrency: 2 });
    return {
        title: `新京报 - 分类 - ${$('.cur').text().trim()}`,
        link: url,
        item: out,
    };
}
