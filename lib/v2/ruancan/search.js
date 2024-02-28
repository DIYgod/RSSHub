const fetchFeed = require('./utils');

module.exports = async (ctx) => {
    const keyword = ctx.req.param('keyword');
    const currentUrl = `/?s=${keyword}`;

    ctx.state.data = await fetchFeed(ctx, currentUrl);
};
