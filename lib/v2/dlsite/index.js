const { ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    ctx.state.data = await ProcessItems(ctx);
};
