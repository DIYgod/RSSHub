const { TITLE, HOST } = require('./const');
const { fetchActivityList, fetchDictionary } = require('./service');

module.exports = async (ctx) => {
    const cityCode = Number.parseInt(ctx.params.cityCode);
    const showStyle = Number.parseInt(ctx.params.showStyle);
    const items = await fetchActivityList({
        cityCode,
        showStyle,
    });
    const { cityName, showName } = await fetchDictionary(cityCode, showStyle);
    const tags = [cityName, showName].filter(Boolean).join(' - ');
    ctx.state.data = {
        title: `${TITLE} - ${tags}`,
        link: HOST,
        item: items,
    };
};
