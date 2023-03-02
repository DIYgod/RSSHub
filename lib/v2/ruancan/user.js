const fetchFeed = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const currentUrl = `/i/${id}`;

    ctx.state.data = await fetchFeed(ctx, currentUrl);
};
