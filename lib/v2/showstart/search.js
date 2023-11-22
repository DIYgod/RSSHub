const { fetchShowRSS } = require('./service');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const { data } = await fetchShowRSS({
        keyword,
    });
    ctx.state.data = {
        ...data,
        title: `${data.title} - ${keyword}`,
    };
};
