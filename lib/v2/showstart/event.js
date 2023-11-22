const { fetchShowRSS } = require('./service');

module.exports = async (ctx) => {
    const { data, $ } = await fetchShowRSS({
        cityCode: ctx.params.cityCode,
        showStyle: ctx.params.showStyle,
    });

    const tags = $('.tools-bar .tag')
        .toArray()
        .map((item) => $(item).text())
        .join(' - ');

    ctx.state.data = {
        ...data,
        title: `${data.title} - ${tags}`,
    };
};
