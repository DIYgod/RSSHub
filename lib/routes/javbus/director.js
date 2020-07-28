const { getPage } = require('./util');

module.exports = async (ctx) => {
    const { directorid } = ctx.params;

    ctx.state.data = await getPage(`https://www.javbus.com/director/${directorid}`, ctx);
};
