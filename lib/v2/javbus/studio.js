const { getPage } = require('./util');

module.exports = async (ctx) => {
    const { studioid } = ctx.params;

    ctx.state.data = await getPage(`https://www.javbus.com/studio/${studioid}`, ctx);
};
