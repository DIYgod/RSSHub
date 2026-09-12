import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchDetail, fetchMain } from './utils';

export const route: Route = {
    path: '/tyyjkxy/:id',
    categories: ['university'],
    example: '/lixin/tyyjkxy/14754',
    parameters: { id: '类别 ID，`info/iList.jsp?cat_id=` 后方数字' },
    name: '体育与健康学院',
    maintainers: ['NeverBehave'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const baseUrl = 'https://tiyu.lixin.edu.cn';
    const link = `${baseUrl}/info/iList.jsp?cat_id=${id}`;
    const { list, title } = await fetchMain(link, 'body > div.erji > div.erjiright > div.rightlist > ul > li');
    const items = await fetchDetail(list, baseUrl, 'body > div.wrapper > div.ContentPage > div.words > div.text');

    return {
        title: `${title} - 体育与健康学院 - 上海立信会计金融学院`,
        link,
        description: `${title} - 体育与健康学院 - 上海立信会计金融学院`,
        item: items,
    };
}
