import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/category/:cid',
    categories: ['new-media'],
    example: '/qutoutiao/category/1',
    parameters: { cid: '分类 id' },
    name: '分类',
    maintainers: ['alphardex', 'LogicJake'],
    description: `| 推荐 | 热点 | 娱乐 | 健康 | 养生 | 励志 | 科技 | ... |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | --- |
| 255  | 1    | 6    | 42   | 5    | 4    | 7    | ... |

更多的 cid 可通过访问[官网](http://home.qutoutiao.net)切换分类，观察 url 获得。`,
    handler,
};

async function handler(ctx: Context) {
    const { cid } = ctx.req.param();
    const response = await ofetch(`http://api.1sapp.com/content/outList?cid=${cid}&tn=1&page=1&limit=10`);
    const result = response.data.data;

    const out = await Promise.all(
        result.map((item) =>
            cache.tryGet(item.url, async () => {
                const detail = await ofetch(item.detail_url);
                return {
                    title: item.title,
                    link: item.url,
                    description: detail.detail ?? item.detail,
                    pubDate: parseDate(item.show_time, 'X'),
                    guid: item.url.split('?', 1)[0],
                    author: item.nickname,
                };
            })
        )
    );

    return {
        title: '趣头条',
        link: 'http://home.qutoutiao.net',
        description: '趣头条',
        item: out,
    };
}
