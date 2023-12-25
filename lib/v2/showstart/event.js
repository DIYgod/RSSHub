const { TITLE, HOST } = require('./const');
const { fetchActivityList, fetchDictionary } = require('./service');

module.exports = async (ctx) => {
    const cityCode = parseInt(ctx.params.cityCode);
    const showStyle = parseInt(ctx.params.showStyle);
    const items = await fetchActivityList({
        cityCode,
        showStyle,
    });
    const { cityName, showName } = await fetchDictionary(cityCode, showStyle);
    const tags = [cityName, showName].filter((item) => Boolean(item)).join(' - ');
    ctx.state.data = {
        title: `${TITLE} - ${tags}`,
        link: HOST,
        item: items,
    };
};
