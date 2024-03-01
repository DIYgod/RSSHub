const fetchItems = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = 'posts';

    ctx.state.data = await fetchItems(ctx, currentUrl);
};
