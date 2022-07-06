const utils = require('./utils');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';

    ctx.state.data = await utils(ctx, category);
};
