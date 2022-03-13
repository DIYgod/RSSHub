const { getPage, getDomain } = require('./util');

module.exports = async (ctx) => {
    const { studioid } = ctx.params;

    ctx.state.data = await getPage(`${getDomain(ctx)}/studio/${studioid}`, ctx);
};
