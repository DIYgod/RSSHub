const fetchFeed = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = '';

    ctx.set('data', await fetchFeed(ctx, currentUrl));
};
