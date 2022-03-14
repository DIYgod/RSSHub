const { getPage, getWesternDomain } = require('../util');

module.exports = async (ctx) => {
    ctx.state.data = await getPage(getWesternDomain(ctx), ctx);
};
