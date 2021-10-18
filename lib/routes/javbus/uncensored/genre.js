const { getPage } = require('../util');

module.exports = async (ctx) => {
    const { gid } = ctx.params;
    ctx.state.data = await getPage(`https://www.busdmm.cam/uncensored/genre/${gid}`, ctx);
};
