const { getPage, getDomain } = require('../util');

module.exports = async (ctx) => {
    const { sid } = ctx.params;

    ctx.state.data = await getPage(`${getDomain(ctx)}/uncensored/star/${sid}`, ctx);
};
