const { getPage } = require('./util');

module.exports = async (ctx) => {
    const { sid } = ctx.params;

    ctx.state.data = await getPage(`https://www.busjav.one/star/${sid}`, ctx);
};
