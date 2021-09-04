const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    ctx.state.data = await utils.ProcessItems(ctx, `${utils.rootUrl}/tag/${id}`);
};
