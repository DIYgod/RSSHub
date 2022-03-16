const { getPage, getWesternDomain } = require('../util');

module.exports = async (ctx) => {
    const { sid } = ctx.params;

    ctx.state.data = await getPage(`${getWesternDomain(ctx)}/star/${sid}`, ctx);
};
