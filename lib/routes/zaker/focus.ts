import * as cheerio from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';

import { baseUrl, fetchItem, getSafeLineCookieWithData, parseList } from './utils';

export const route: Route = {
    path: '/focusread',
    radar: [
        {
            source: ['www.myzaker.com/'],
            target: '/focusread',
        },
    ],
    name: '精读',
    example: '/zaker/focusread',
    maintainers: ['AlexdanerZe', 'TonyRL'],
    handler,
};

async function handler() {
    const link = `${baseUrl}/?pos=selected_article`;

    const { cookie, data } = await getSafeLineCookieWithData(link);

    const $ = cheerio.load(data);
    const list = parseList($);

    const items = await pMap(list, (item) => cache.tryGet(item.link!, () => fetchItem(item, cookie)), { concurrency: 2 });

    return {
        title: 'ZAKER 精读新闻',
        link,
        item: items,
    };
}
