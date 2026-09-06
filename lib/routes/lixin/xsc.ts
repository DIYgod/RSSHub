import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchDetail, fetchMain } from './utils';

export const route: Route = {
    path: '/xsc/:id',
    categories: ['university'],
    example: '/lixin/xsc/13789',
    parameters: { id: '类别 ID，`info/iList.jsp?cat_id=` 后方数字' },
    name: '学生处',
    maintainers: ['NeverBehave'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const baseUrl = 'https://xsc.lixin.edu.cn';
    const link = `${baseUrl}/info/iList.jsp?cat_id=${id}`;
    const { list, title } = await fetchMain(link, 'body > div.details > div.contentright > div.rightlist > ul > li');
    const items = await fetchDetail(list, baseUrl, 'body > div.neirong > div.rong');

    return {
        title: `${title} - 学生处 - 上海立信会计金融学院`,
        link,
        description: `${title} - 学生处 - 上海立信会计金融学院`,
        item: items,
    };
}
