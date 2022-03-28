const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.state.data = await utils(ctx, `tag/${ctx.params.id}`);
};
