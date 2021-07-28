const { getPage } = require('../util');

module.exports = async (ctx) => {
    const { gid } = ctx.params;
    ctx.state.data = await getPage(`https://www.javbus.com/uncensored/genre/${gid}`, ctx);
};
