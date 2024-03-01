const { rootUrl, apiRootUrl, processItems, icon, image } = require('./util');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 50;

    const apiUrl = new URL('v1/news', apiRootUrl).href;
    const currentUrl = new URL('news', rootUrl).href;

    const { items } = await processItems(apiUrl, limit);

    ctx.state.data = {
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
    };
};
