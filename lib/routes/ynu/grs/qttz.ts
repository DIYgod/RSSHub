import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { processPages } from '../utils';

export const route: Route = {
    path: '/grs/qttz/:category',
    categories: ['university'],
    example: '/ynu/grs/qttz/2',
    parameters: { category: '研究生院通知分类' },
    features: {
        antiCrawler: true,
    },
    radar: [{ source: ['grs.ynu.edu.cn/*'] }],
    name: '研究生院其他通知',
    maintainers: ['hzcheney'],
    description: `| 招生工作 | 研究生培养 | 质量管理 | 学位工作 | 综合办公室 | 相关下载 |
| -------- | ---------- | -------- | -------- | ---------- | -------- |
| 1        | 2          | 3        | 4        | 5          | 6        |`,
    handler,
};

async function handler(ctx: Context) {
    const host = 'http://www.grs.ynu.edu.cn/';
    const { category } = ctx.req.param();
    const dep = ['招生工作', '研究生培养', '质量管理', '学位工作', '综合办公室', '相关下载'];

    const response = await ofetch('http://www.grs.ynu.edu.cn/index.htm');

    const $ = load(response);
    const list = $('#con3:nth-of-type(' + category + ') ul li')
        .slice(0, 6)
        .toArray()
        .map((e) => ({
            path: $('a', e).attr('href') ?? '',
            title: $('a', e).attr('title') ?? '',
            author: dep[Number(category) - 1],
        }));
    const out = await processPages({ list, host, department: 'grs' });

    return {
        title: '云南大学研究生院' + dep[Number(category) - 1] + '通知',
        link: host,
        description: '云南大学研究生院' + dep[Number(category) - 1],
        item: out,
    };
}
