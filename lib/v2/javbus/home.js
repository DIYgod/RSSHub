const { getPage, getDomain } = require('./util');

module.exports = async (ctx) => {
    ctx.state.data = await getPage(getDomain(ctx), ctx);
};
