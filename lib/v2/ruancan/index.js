const fetchFeed = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = '';

    ctx.state.data = await fetchFeed(ctx, currentUrl);
};
