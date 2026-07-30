import type { Route } from '@/types';
import cache from '@/utils/cache';

import { baseUrl, getItem } from './utils';

export const route: Route = {
    path: '/article/:date/:hash',
    categories: ['traditional-media'],
    example: '/qstheory/article/20260715/01c61f4ff2af4af8bc50757dfff4976e',
    parameters: {
        date: '文章日期，格式 `YYYYMMDD`，例如 `20260715`',
        hash: '文章链接中的一段十六进制哈希串',
    },
    radar: [
        {
            source: ['www.qstheory.cn/:date/:hash/c.html'],
            target: '/article/:date/:hash',
        },
    ],
    name: '文章',
    maintainers: ['zhangsan-xyz'],
    handler,
};

async function handler(ctx) {
    const { date, hash } = ctx.req.param();

    const link = `${baseUrl}/${date}/${hash}/c.html`;
    const item = await cache.tryGet(link, () => getItem({ link }));

    return {
        title: item.title,
        link,
        item: [item],
    };
}
