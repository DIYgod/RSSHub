import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/whale/rank/:type/:rule',
    categories: ['social-media'],
    example: '/dgtle/whale/rank/download/day',
    parameters: { type: '排行榜类型', rule: '排行榜周期' },
    name: '鲸图（排行榜）',
    maintainers: ['Erriy'],
    description: `type

| 下载排行榜 | 点赞排行榜 |
| ---------- | ---------- |
| download   | like       |

rule

| 日排行 | 周排行 | 月排行 | 总排行 |
| ------ | ------ | ------ | ------ |
| day    | week   | month  | amount |`,
    handler,
};

async function handler(ctx: Context) {
    const { type, rule } = ctx.req.param();
    if (!['download', 'like'].includes(type) || !['day', 'week', 'month', 'amount'].includes(rule)) {
        throw new InvalidParameterError('Invalid ranking parameters. Use download or like, and day, week, month, or amount.');
    }

    const stype = {
        download: '下载',
        like: '点赞',
    };

    const srule = {
        day: '日排行',
        week: '周排行',
        month: '月排行',
        amount: '总排行',
    };

    const host = 'https://www.dgtle.com';

    const response = await ofetch(`https://opser.api.dgtle.com/v1/whale-rank/list?rule=${rule}&type=${type}`);

    const items = response.items.map((item) => ({
        title: item.content,
        pubDate: item.created_at ? parseDate(item.created_at, 'X') : undefined,
        updated: item.updated_at ? parseDate(item.updated_at, 'X') : undefined,
        author: item.author.username,
        description: `<img src=${item.attachment.pic_url.split('?', 1)[0]} />`,
        link: item.attachment.pic_url.split('?', 1)[0],
    }));

    return {
        title: `数字尾巴 - 鲸图 - ${stype[type]}${srule[rule]}`,
        description: '鲸图排行榜',
        link: host,
        item: items,
    };
}
