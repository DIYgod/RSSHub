// @ts-nocheck
const { rootUrl, apiRootUrl, processItems, icon, image } = require('./util');

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const apiUrl = new URL(`v2/feed`, apiRootUrl).href;

    const { items } = await processItems(apiUrl, limit);

    ctx.set('data', {
        item: items,
        title: 'Foresight News - 精选资讯',
        link: rootUrl,
        description: 'FN精选 - Foresight News',
        language: 'zh-cn',
        image,
        icon,
        logo: icon,
        subtitle: '精选资讯',
        author: 'Foresight News',
    });
};
