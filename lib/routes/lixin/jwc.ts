import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchDetail, fetchMain } from './utils';

export const route: Route = {
    path: '/jwc/:id',
    categories: ['university'],
    example: '/lixin/jwc/13424',
    parameters: { id: '类别 ID，`info/iList.jsp?cat_id=` 后方数字' },
    name: '教务处',
    maintainers: ['NeverBehave'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const baseUrl = 'https://jwc.lixin.edu.cn';
    const link = `${baseUrl}/info/iList.jsp?cat_id=${id}`;
    const { list, title } = await fetchMain(link, 'body > div.details > div.contentright > div.rightlist > ul > li');
    const items = await fetchDetail(list, baseUrl, 'body > div.neirong > div.rong');

    return {
        title: `${title} - 教务处 - 上海立信会计金融学院`,
        link,
        description: `${title} - 教务处 - 上海立信会计金融学院`,
        item: items,
    };
}
