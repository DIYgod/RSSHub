const fetchItems = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = 'posts';

    ctx.set('data', await fetchItems(ctx, currentUrl));
};
