import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import cache from '@/utils/cache';
import { baseUrl, getItem } from './utils';

export const route: Route = {
    path: '/magazine/:magazine',
    categories: ['traditional-media'],
    example: '/qstheory/magazine/qs',
    parameters: { magazine: '刊物，`qs` 为求是，`hqwglist` 为红旗文稿' },
    radar: [
        {
            source: ['www.qstheory.cn/:magazine/mulu.htm'],
        },
    ],
    name: '在线读刊',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { magazine } = ctx.req.param();

    const link = `${baseUrl}/${magazine}/mulu.htm`;
    const yearResponse = await ofetch(link);

    const $ = cheerio.load(yearResponse);

    const yearList = $('.booktitle a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href')!,
            };
        });

    const issueResponse = await ofetch(yearList[0].link);
    const $$ = cheerio.load(issueResponse);

    const list = $$('.highlight span a')
        .toArray()
        .map((item) => {
            const $item = $$(item);
            return {
                title: $item.text(),
                link: $item.attr('href')!,
            };
        })
        .toReversed()
        .filter((item) => item.title);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => getItem(item))));

    return {
        title: $('head title').text(),
        link,
        image: new URL($('.book img').attr('src')!, link).href,
        item: items,
    };
}
