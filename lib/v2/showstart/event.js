const { fetchShowRSS } = require('./service');

module.exports = async (ctx) => {
    ctx.state.data = await fetchShowRSS({
        cityCode: ctx.params.cityCode,
        showStyle: ctx.params.showStyle,
    });
};
