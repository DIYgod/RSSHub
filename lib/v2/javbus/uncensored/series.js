const { getPage, getDomain } = require('../util');

module.exports = async (ctx) => {
    const { seriesid } = ctx.params;

    ctx.state.data = await getPage(`${getDomain(ctx)}/uncensored/series/${seriesid}`, ctx);
};
