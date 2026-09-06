import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchDetail, fetchMain } from './utils';

export const route: Route = {
    path: '/tzgg/:id',
    categories: ['university'],
    example: '/lixin/tzgg/12707',
    parameters: { id: '类别 ID，`info/iList.jsp?cat_id=` 后方数字' },
    name: '官网',
    maintainers: ['NeverBehave'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const baseUrl = 'https://www.lixin.edu.cn';
    const link = `${baseUrl}/info/iList.jsp?cat_id=${id}`;
    const { list, title } = await fetchMain(link, 'body > table > tbody > tr > td:nth-child(2) > div.xjr_list > ul > li');
    const items = await fetchDetail(list, baseUrl, 'body > table > tbody > tr > td:nth-child(2) > div.xjr_content');

    return {
        title: `${title} - 官网 - 上海立信会计金融学院`,
        link,
        description: `${title} - 官网 - 上海立信会计金融学院`,
        item: items,
    };
}
