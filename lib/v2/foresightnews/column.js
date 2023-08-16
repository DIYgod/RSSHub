const { rootUrl, apiRootUrl, processItems, icon, image } = require('./util');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 50;

    const apiUrl = new URL('v1/articles', apiRootUrl).href;
    const currentUrl = new URL(`column/detail/${id}`, rootUrl).href;

    const { items, info } = await processItems(apiUrl, limit, {
        column_id: id,
    });

    const column = info.column;

    ctx.state.data = {
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
    };
};
