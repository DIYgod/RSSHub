const fetchFeed = require('./utils');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const currentUrl = `/cat/${category}`;

    ctx.state.data = await fetchFeed(ctx, currentUrl);
};
