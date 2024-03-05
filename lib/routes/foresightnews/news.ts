// @ts-nocheck
const { rootUrl, apiRootUrl, processItems, icon, image } = require('./util');

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const apiUrl = new URL('v1/news', apiRootUrl).href;
    const currentUrl = new URL('news', rootUrl).href;

    const { items } = await processItems(apiUrl, limit);

    ctx.set('data', {
        item: items,
        title: 'Foresight News - 快讯',
        link: currentUrl,
        description: '快讯 - Foresight News',
        language: 'zh-cn',
        image,
        icon,
        logo: icon,
        subtitle: '快讯',
        author: 'Foresight News',
    });
};
