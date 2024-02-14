const { rootUrl, apiRootUrl, processItems, icon, image } = require('./util');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 50;

    const apiUrl = new URL('v1/articles', apiRootUrl).href;

    const { items } = await processItems(apiUrl, limit);

    ctx.state.data = {
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
    };
};
