const utils = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = ctx.params.caty || 'mindmaps';

    ctx.state.data = await utils(ctx, currentUrl);
};
