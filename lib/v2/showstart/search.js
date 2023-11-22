const { fetchShowRSS } = require('./service');

module.exports = async (ctx) => {
    ctx.state.data = await fetchShowRSS({
        keyword: ctx.params.keyword,
    });
};
