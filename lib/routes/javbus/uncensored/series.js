const { getPage } = require('../util');

module.exports = async (ctx) => {
    const { seriesid } = ctx.params;

    ctx.state.data = await getPage(`https://www.busdmm.cam/uncensored/series/${seriesid}`, ctx);
};
