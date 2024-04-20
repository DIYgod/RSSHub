const utils = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `search/${ctx.params.model}/tags/${ctx.params.keyword ?? ''}${ctx.params.sortBy ? '?sortby=' + ctx.params.sortBy : ''}`;

    ctx.state.data = await utils(ctx, currentUrl);
};
