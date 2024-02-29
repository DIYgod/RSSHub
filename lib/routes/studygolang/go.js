const { FetchGoItems } = require('./utils');

module.exports = async (ctx) => {
    ctx.set('data', await FetchGoItems(ctx));
};
