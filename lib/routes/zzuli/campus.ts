import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/campus/:type',
    categories: ['university'],
    example: '/zzuli/campus/0',
    parameters: { type: '分类，见下表' },
    name: '智慧门户',
    maintainers: ['Fantasia1999'],
    handler,
    description: `| 参数名称 | 公告信息 | 学工信息 | 教学信息 | 信息快递 | 学术报告 | 科研信息 | 网络公告 | 班车查询 | 周会表 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ------ |
| 参数     | 0        | 1        | 2        | 3        | 4        | 5        | 6        | 7        | 8      |`,
};

const map = new Map([
    [0, { title: '公告信息', link: 'https://info.zzuli.edu.cn/_t961/2464/list.htm' }],
    [1, { title: '学工信息', link: 'https://info.zzuli.edu.cn/_t961/xsxx/list.htm' }],
    [2, { title: '教学信息', link: 'https://info.zzuli.edu.cn/_t961/jwxx/list.htm' }],
    [3, { title: '信息快递', link: 'https://info.zzuli.edu.cn/_t961/2536/list.htm' }],
    [4, { title: '学术报告', link: 'https://info.zzuli.edu.cn/_t961/xsbg/list.htm' }],
    [5, { title: '科研信息', link: 'https://info.zzuli.edu.cn/_t961/kyxx/list.htm' }],
    [6, { title: '网络公告', link: 'https://info.zzuli.edu.cn/_s19/_t960/wlgg/list.psp' }],
    [7, { title: '班车查询', link: 'https://info.zzuli.edu.cn/_s19/_t960/2619/list.htm' }],
    [8, { title: '周会表', link: 'https://info.zzuli.edu.cn/_s19/_t960/bzhy/list.psp' }],
]);

async function handler(ctx: Context) {
    const type = Number.parseInt(ctx.req.param('type') ?? '');
    const { title, link } = map.get(type)!;

    const response = await ofetch(link);
    const $ = load(response);

    const items = $('.lists tr')
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
        title: `${title} - 郑州轻工业大学智慧门户`,
        link,
        item: items,
    };
}
