const { getPage, getDomain } = require('./util');

module.exports = async (ctx) => {
    const { labelid } = ctx.params;

    ctx.state.data = await getPage(`${getDomain(ctx)}/label/${labelid}`, ctx);
};
