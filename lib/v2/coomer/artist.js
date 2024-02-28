const fetchItems = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.req.param('id');

    const currentUrl = `onlyfans/user/${id}`;

    ctx.set('data', await fetchItems(ctx, currentUrl));
};
