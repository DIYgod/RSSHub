import { Route } from '@/types';
import cache from '@/utils/cache';
import * as cheerio from 'cheerio';
import { baseUrl, fetchItem, getSafeLineCookieWithData, parseList } from './utils';
import asyncPool from 'tiny-async-pool';

export const route: Route = {
    path: '/channel/:id?',
    parameters: {
        id: '分类 ID，可在 URL 中找到，默认为 `1`',
    },
    radar: [
        {
            source: ['www.myzaker.com/channel/:id'],
            target: '/channel/:id',
        },
    ],
    name: '分类',
    example: '/zaker/channel/13',
    maintainers: ['LogicJake', 'kt286', 'TonyRL'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 1;
    const link = `${baseUrl}/channel/${id}`;

    const { cookie, data } = await getSafeLineCookieWithData(link);

    const $ = cheerio.load(data);
    const feedTitle = $('head title').text();
    const list = parseList($);

    const items = [];
    for await (const item of asyncPool(2, list, (item) => cache.tryGet(item.link!, () => fetchItem(item, cookie)))) {
        items.push(item);
    }

    return {
        title: feedTitle,
        link,
        item: items,
    };
}
