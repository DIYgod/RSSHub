const { getPage, getWesternDomain } = require('../util');

module.exports = async (ctx) => {
    const { seriesid } = ctx.params;

    ctx.state.data = await getPage(`${getWesternDomain(ctx)}/series/${seriesid}`, ctx);
};
