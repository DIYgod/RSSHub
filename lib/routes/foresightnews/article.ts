// @ts-nocheck
const { rootUrl, apiRootUrl, processItems, icon, image } = require('./util');

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const apiUrl = new URL('v1/articles', apiRootUrl).href;

    const { items } = await processItems(apiUrl, limit);

    ctx.set('data', {
        item: items,
        title: 'Foresight News - 文章',
        link: rootUrl,
        description: '文章 - Foresight News',
        language: 'zh-cn',
        image,
        icon,
        logo: icon,
        subtitle: '文章',
        author: 'Foresight News',
    });
};
