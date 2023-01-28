const fetchFeed = require('./utils');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const currentUrl = `/?s=${keyword}`;

    ctx.state.data = await fetchFeed(ctx, currentUrl);
};
