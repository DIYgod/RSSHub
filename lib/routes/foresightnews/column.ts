// @ts-nocheck
const { rootUrl, apiRootUrl, processItems, icon, image } = require('./util');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const apiUrl = new URL('v1/articles', apiRootUrl).href;
    const currentUrl = new URL(`column/detail/${id}`, rootUrl).href;

    const { items, info } = await processItems(apiUrl, limit, {
        column_id: id,
    });

    const column = info.column;

    ctx.set('data', {
        item: items,
        title: `Foresight News - ${column}`,
        link: currentUrl,
        description: `${column} - Foresight News`,
        language: 'zh-cn',
        image,
        icon,
        logo: icon,
        subtitle: column,
        author: 'Foresight News',
    });
};
