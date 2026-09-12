import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjsc/:type',
    categories: ['university'],
    example: '/zzuli/yjsc/0',
    parameters: { type: '分类，见下表' },
    name: '研究生处',
    maintainers: ['Fantasia1999'],
    handler,
    description: `| 参数名称 | 公告通知 | 招生工作 | 新闻资讯 | 培养工作 | 学位工作 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 参数     | 0        | 1        | 2        | 3        | 4        |`,
};

const map = new Map([
    [0, { title: '公告通知', link: 'https://yjsc.zzuli.edu.cn/ggtz/list.htm' }],
    [1, { title: '招生工作', link: 'https://yjsc.zzuli.edu.cn/2878/list.htm' }],
    [2, { title: '新闻资讯', link: 'https://yjsc.zzuli.edu.cn/2918/list.htm' }],
    [3, { title: '培养工作', link: 'https://yjsc.zzuli.edu.cn/2882/list.htm' }],
    [4, { title: '学位工作', link: 'https://yjsc.zzuli.edu.cn/2890/list.htm' }],
]);

async function handler(ctx: Context) {
    const type = Number.parseInt(ctx.req.param('type') ?? '');
    const { title, link } = map.get(type)!;

    const response = await ofetch(link);
    const $ = load(response);

    const items = $('div table tbody tr td table tbody tr')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('td a').attr('title') ?? '',
                link: $item.find('td a').attr('href'),
                pubDate: parseDate($item.find('td div').text()),
            };
        });

    return {
        title: `${title} - 郑州轻工业大学研究生处`,
        link,
        item: items,
    };
}
