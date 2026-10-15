import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const tags = {
    '1': '头条',
    '159': 'FIA文档',
    '156': '赛会信息',
    '158': '社交媒体',
    '223': '新闻媒体',
    '5': 'MotoGP',
    '52': 'FE',
    '126': '纽维自传',
    '127': 'TopSpeed最速档',
    '18': '专栏',
    '125': 'TCR',
    '175': 'F1运动规则',
    '3': '科普',
    '19': '视频',
    '64': '新车发布',
    '57': '达喀尔',
};

export const route: Route = {
    path: '/news/:tagId?',
    categories: ['sport'],
    example: '/romielf/news',
    parameters: {
        tagId: {
            description: '导航标签 id，可在 `https://api.romielf.com/index/navitv2` 查看',
            default: '1',
            options: Object.entries(tags).map(([value, label]) => ({ value, label })),
        },
    },
    name: '新闻',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.romielf.com',
};

async function handler(ctx: Context) {
    const { tagId = '1' } = ctx.req.param();
    const apiUrl = 'https://api.romielf.com';

    const response = await ofetch(`${apiUrl}/index/index`, {
        query: { tag_id: tagId, page: 1 },
    });

    const list: Array<{ id: number; title: string; publish_time?: number; tags: Array<{ name: string }>; covers: Array<{ path_url: string }> }> = response.data.list;
    const items = await pMap(
        list,
        async (item) => {
            const link = `https://news.romielf.com/news.html?id=${item.id}`;
            const details = await cache.tryGet(`romielf:article:v1:${link}`, async () => {
                const { data } = await ofetch(`${apiUrl}/index/detail`, { query: { id: item.id } });
                return { description: data.details.content, author: data.details.user_name, temotime: data.details.temotime };
            });
            const { temotime } = details;
            return {
                title: item.title,
                link,
                description: details.description,
                author: details.author,
                pubDate: item.publish_time ? parseDate(item.publish_time * 1000) : temotime ? (temotime.endsWith('前') ? parseRelativeDate(temotime) : timezone(parseRelativeDate(temotime), 8)) : undefined,
                category: item.tags.map((tag) => tag.name),
                image: item.covers[0]?.path_url,
            } as DataItem;
        },
        { concurrency: 3 }
    );

    return {
        title: `每日赛车 - ${tags[tagId] ?? tagId}`,
        link: 'https://www.romielf.com',
        item: items,
    };
}
