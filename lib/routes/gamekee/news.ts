import type { Context } from 'hono';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { getDetail, headers } from './utils';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/gamekee/news',
    radar: [
        {
            source: ['gamekee.com', 'gamekee.com/news'],
            target: '/news',
        },
    ],
    name: '游戏情报',
    maintainers: ['ueiu'],
    handler,
    url: 'gamekee.com/news',
};

async function handler(ctx: Context) {
    const rootUrl = 'https://www.gamekee.com';
    const url = `${rootUrl}/v1/index/newsList`;
    const { data } = await ofetch<{ data: Array<{ id: number; title: string; created_at: number }> }>(url, {
        headers: {
            ...headers,
            'User-Agent': config.ua,
        },
        query: {
            page_no: 1,
            limit: 20,
        },
    });
    let list = data.map((item) => {
        const link = new URL(`${item.id}.html`, rootUrl).href;
        const title = item.title;
        const pubDate = parseDate(item.created_at, 'X');
        return {
            id: item.id,
            link,
            title,
            pubDate,
        };
    });
    const limit = getRouteLimit(ctx);
    if (limit && (ctx.req.query('sorted') === 'false' || list.every((item) => Number.isFinite(item.pubDate.getTime())))) {
        if (ctx.req.query('sorted') !== 'false') {
            list.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
        }
        list = list.slice(0, limit);
    }
    const items = await pMap(list, async ({ id, ...item }) => ({ ...item, ...(await cache.tryGet(`gamekee:detail:${id}`, () => getDetail(id))) }), { concurrency: 3 });

    return {
        link: `${rootUrl}/news`,
        title: '游戏情报|Gamekee',
        item: items,
    };
}
