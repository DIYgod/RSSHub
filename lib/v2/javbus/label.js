const { getPage } = require('./util');

module.exports = async (ctx) => {
    const { labelid } = ctx.params;

    ctx.state.data = await getPage(`https://www.javbus.com/label/${labelid}`, ctx);
};
