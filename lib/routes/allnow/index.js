const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.state.data = await utils.ProcessItems(ctx, utils.rootUrl);
};
