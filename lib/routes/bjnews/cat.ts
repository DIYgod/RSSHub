import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

import { fetchArticle } from './utils';
import asyncPool from 'tiny-async-pool';

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
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 15)
        .map((a) => ({
            title: $(a).text(),
            link: $(a).attr('href'),
            category: $(a).parent().find('.source').text().trim(),
        }));

    const out = await asyncPoolAll(2, list, (item) => fetchArticle(item));
    return {
        title: `新京报 - 分类 - ${$('.cur').text().trim()}`,
        link: url,
        item: out,
    };
}
async function asyncPoolAll<IN, OUT>(poolLimit: number, array: readonly IN[], iteratorFn: (generator: IN) => Promise<OUT>) {
    const results: Awaited<OUT[]> = [];
    for await (const result of asyncPool(poolLimit, array, iteratorFn)) {
        results.push(result);
    }
    return results;
}
