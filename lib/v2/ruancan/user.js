const fetchFeed = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.req.param('id');
    const currentUrl = `/i/${id}`;

    ctx.set('data', await fetchFeed(ctx, currentUrl));
};
