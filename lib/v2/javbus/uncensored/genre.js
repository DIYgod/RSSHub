const { getPage, getDomain } = require('../util');

module.exports = async (ctx) => {
    const { gid } = ctx.params;
    ctx.state.data = await getPage(`${getDomain(ctx)}/uncensored/genre/${gid}`, ctx);
};
