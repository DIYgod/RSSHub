const { getPage } = require('../util');

module.exports = async (ctx) => {
    const { gid } = ctx.params;
    ctx.state.data = await getPage(`https://www.busjav.one/uncensored/genre/${gid}`, ctx);
};
