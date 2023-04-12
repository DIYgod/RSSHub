const { FetchGoItems } = require('./utils');

module.exports = async (ctx) => {
    ctx.params.id = 'jobs';

    ctx.state.data = await FetchGoItems(ctx);
};
