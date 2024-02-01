const utils = require('./utils');

module.exports = async (ctx) => {
    const keyword = decodeURIComponent(ctx.params.keyword);
    const limit = ctx.params.limit || 20;
    const items = [];

    let pages = Math.ceil(limit / 20);
    pages = pages > 10 ? 10 : pages;
    const urls = Array.from({ length: pages }, (_, i) => `https://www.nicesss.com/page/${i + 1}?s=${keyword}`);

    try {
        const itemPromises = urls.map((url) => utils.ProcessUrl(url, ctx));
        const allItems = await Promise.all(itemPromises);
        items.push(...allItems.flat());
    } catch (error) {
        throw new Error(error);
    }

    ctx.state.data = {
        title: `呦糖社 - “${keyword}”搜索结果`,
        link: `https://www.nicesss.com/?s=${keyword}`,
        description: `呦糖社 - “${keyword}”搜索结果`,
        image: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/logo/logo-light.png',
        icon: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/favicon/favicon.png',
        logo: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/favicon/favicon.png',
        item: items.slice(0, limit),
    };
};
