import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { processPages } from '../utils';

export const route: Route = {
    path: '/jwc/:category',
    categories: ['university'],
    example: '/ynu/jwc/1',
    parameters: { category: '教务处通知分类' },
    features: {
        antiCrawler: true,
    },
    radar: [{ source: ['www.jwc.ynu.edu.cn/*'] }],
    name: '教务处主要通知',
    maintainers: ['hzcheney'],
    description: `| 教务科 | 学籍科 | 教学研究科 | 实践科学科 |
| ------ | ------ | ---------- | ---------- |
| 1      | 2      | 3          | 4          |`,
    handler,
};

async function handler(ctx: Context) {
    const host = 'https://www.jwc.ynu.edu.cn/';
    const { category } = ctx.req.param();
    const dep = ['教务科', '学籍科', '教学研究科', '实践教学科'];

    const response = await ofetch(host);

    const $ = load(response);
    const firstRow = Number(category) < 3 ? 0 : 1;
    const secondRow = Number(category) % 2 === 0 ? 2 : 1;

    const list = $('.index-row3')
        .eq(firstRow)
        .find(`.c${secondRow} .text-list ul li`)
        .slice(0, 8)
        .toArray()
        .map((e) => ({
            path: $('a', e).attr('href') ?? '',
            title: $('a', e).attr('title') ?? '',
            author: dep[Number(category) - 1],
        }));

    const out = await processPages({ list, host, department: 'jwc' });

    return {
        title: '云南大学教务处' + dep[Number(category) - 1] + '通知',
        link: host,
        description: '云南大学教务处' + dep[Number(category) - 1],
        item: out,
    };
}
