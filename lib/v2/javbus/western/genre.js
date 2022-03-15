const { getPage, getWesternDomain } = require('../util');

module.exports = async (ctx) => {
    const { gid } = ctx.params;

    ctx.state.data = await getPage(`${getWesternDomain(ctx)}/genre/${gid}`, ctx);
};
