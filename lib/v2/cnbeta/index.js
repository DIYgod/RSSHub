const parser = require('@/utils/rss-parser');

const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/backend.php`;

    let { items } = await parser.parseURL(currentUrl);
    items = items.filter((item) => item.link.includes('cnbeta'));

    ctx.state.data = {
        title: 'cnBeta',
        link: currentUrl,
        item: await ProcessItems(items, ctx.query.limit, ctx.cache.tryGet),
    };
};
