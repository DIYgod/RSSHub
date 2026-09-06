import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/bh2/:type?',
    categories: ['game'],
    example: '/mihoyo/bh2/gach',
    parameters: { type: '公告种类，默认为 `all`' },
    name: '崩坏 2 - 游戏公告',
    maintainers: ['deepred5'],
    description: `| 全部 | 最新公告 | 版本信息 | 祈愿信息 | 活动介绍 |
| ---- | -------- | -------- | -------- | -------- |
| all  | new      | version  | gach     | event    |`,
    handler,
    url: 'www.benghuai.com/index/',
};

const typeArr = ['new', 'version', 'gach', 'event'];

async function handler(ctx: Context) {
    const { type = 'all' } = ctx.req.param();
    const baseUrl = 'https://www.benghuai.com';

    const response = await ofetch(`${baseUrl}/main/getIndexNotice`, {
        method: 'POST',
        headers: {
            Referer: `${baseUrl}/index/`,
            'x-requested-with': 'XMLHttpRequest',
        },
        parseResponse: JSON.parse,
    });

    const types = typeArr.includes(type) ? [type] : typeArr;
    const data = types.flatMap((t) => response.data[t].map((item) => ({ ...item, index: typeArr.indexOf(t) + 1 })));
    const list = new Map(data.map((item) => [item.id, item]))
        .values()
        .toArray()
        .map((item): DataItem & { link: string } => ({
            title: item.title,
            pubDate: timezone(parseDate(item.time), 8),
            link: `${baseUrl}/news/?para=${item.index}_${item.id}`,
            id: item.id,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detail = await ofetch(`${baseUrl}/news/getNoticeByID?id=${item.id}`, {
                    method: 'POST',
                    headers: {
                        Referer: item.link,
                        'x-requested-with': 'XMLHttpRequest',
                    },
                    parseResponse: JSON.parse,
                });
                item.description = detail.data.text;
                return item;
            })
        )
    );

    const title = `崩坏2-${type}`;

    return {
        title,
        link: `${baseUrl}/news/`,
        description: title,
        item: items,
    };
}
