import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { baseUrl, getItem } from './utils';

export const route: Route = {
    path: '/magazine/:magazine/article/:date/:hash',
    categories: ['traditional-media'],
    example: '/qstheory/magazine/qs/article/20260715/01c61f4ff2af4af8bc50757dfff4976e',
    parameters: {
        magazine: '刊物，`qs` 为求是，`hqwglist` 为红旗文稿',
        date: '文章日期，格式 `YYYYMMDD`，例如 `20260715`',
        hash: '文章链接中的一段十六进制哈希串',
    },
    radar: [
        {
            source: ['www.qstheory.cn/:date/:hash/c.html'],
            target: '/magazine/qs/article/:date/:hash',
        },
    ],
    name: '文章',
    maintainers: ['TonyRL', 'cscnk52'],
    handler,
};

async function handler(ctx) {
    const { date, hash } = ctx.req.param();

    const link = `${baseUrl}/${date}/${hash}/c.html`;
    const item = await cache.tryGet(link, async () => {
        const response = await ofetch(link);
        const $ = load(response);
        const data = await getItem({ title: $('h1').first().text().trim() || $('head title').text().trim(), link });
        return data;
    });

    return {
        title: `求是杂志 - ${item.title}`,
        link: `${baseUrl}/${date}`,
        item: [item],
    };
}
