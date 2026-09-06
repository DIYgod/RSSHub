import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/whale/category/:category',
    categories: ['social-media'],
    example: '/dgtle/whale/category/0',
    parameters: { category: '分类 id' },
    name: '鲸图（分类）',
    maintainers: ['Erriy'],
    description: `| 精选 | 人物 | 静物 | 二次元 | 黑白 | 自然 | 美食 | 电影与游戏 | 科技与艺术 | 城市与建筑 | 萌物 | 美女 |
| ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---------- | ---------- | ---------- | ---- | ---- |
| 0    | 1    | 2    | 3      | 4    | 5    | 6    | 7          | 8          | 9          | 10   | 11   |`,
    handler,
};

async function handler(ctx: Context) {
    const cid = Number(ctx.req.param('category'));

    const categories = ['精选', '人物', '静物', '二次元', '黑白', '自然', '美食', '电影与游戏', '科技与艺术', '城市与建筑', '萌物', '美女'];

    const host = 'https://www.dgtle.com';

    const response = await ofetch(`https://opser.api.dgtle.com/v1/whale/index?category_id=${cid}&page=1&per-page=10`);

    const items = response.items.map((item) => ({
        title: item.content,
        pubDate: parseDate(item.updated_at * 1000),
        author: item.author.username,
        description: `<img src=${item.attachment.pic_url.split('?', 1)[0]} />`,
        link: item.attachment.pic_url.split('?', 1)[0],
    }));

    return {
        title: `数字尾巴 - 鲸图 - ${categories[cid]}`,
        description: '分类鲸图',
        link: host,
        item: items,
    };
}
