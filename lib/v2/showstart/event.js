const { TITLE, HOST } = require('./const');
const { fetchActivityList } = require('./service');

module.exports = async (ctx) => {
    const { items } = await fetchActivityList({
        cityCode: ctx.params.cityCode,
        showStyle: ctx.params.showStyle,
    });
    ctx.state.data = {
        // todo: add city and style info
        title: String(TITLE),
        link: HOST,
        item: items,
    };
};
