const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.state.data = await utils.processItems(ctx, utils.rootUrl);
};
