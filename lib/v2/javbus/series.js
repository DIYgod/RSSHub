const { getPage } = require('./util');

module.exports = async (ctx) => {
    const { seriesid } = ctx.params;

    ctx.state.data = await getPage(`https://www.busjav.one/series/${seriesid}`, ctx);
};
