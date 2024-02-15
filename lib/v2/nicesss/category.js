const utils = require('./utils');

module.exports = async (ctx) => {
    const limit = ctx.params.limit || 20;
    const items = [];
    const categoryID = ctx.params.category_id;

    let pages = Math.ceil(limit / 10);
    pages = pages > 10 ? 10 : pages;
    const urls = Array.from({ length: pages }, (_, i) => `https://www.nicesss.com/wp-json/wp/v2/posts?categories=${categoryID}&page=${i + 1}`);

    const itemPromises = urls.map((url) => utils.processUrl(url, ctx));
    const allItems = await Promise.all(itemPromises);
    items.push(...allItems.flat());

    const category = await utils.processCategory(ctx, categoryID);

    ctx.state.data = {
        title: `呦糖社 - “${category.name}”Category结果`,
        link: category.link,
        description: `呦糖社 - “${category.name}”Category结果`,
        image: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/logo/logo-light.png',
        icon: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/favicon/favicon.png',
        logo: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/favicon/favicon.png',
        item: items.slice(0, limit),
    };
};
