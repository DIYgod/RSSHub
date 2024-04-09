const { FetchGoItems } = require('./utils');

module.exports = async (ctx) => {
    ctx.state.data = await FetchGoItems(ctx);
};
