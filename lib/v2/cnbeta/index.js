const parser = require('@/utils/rss-parser');

const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/backend.php`;

    const { items } = await parser.parseURL(currentUrl);

    ctx.state.data = {
        title: 'cnBeta',
        link: currentUrl,
        item: await ProcessItems(items, ctx.query.limit, ctx.cache.tryGet),
    };
};
