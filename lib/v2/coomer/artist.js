const fetchItems = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.req.param('id');

    const currentUrl = `onlyfans/user/${id}`;

    ctx.state.data = await fetchItems(ctx, currentUrl);
};
