const { TITLE, HOST } = require('./const');
const { fetchActivityList, fetchPerformerList, fetchBrandList, fetchCityList, fetchStyleList } = require('./service');

module.exports = async (ctx) => {
    const type = ctx.params.type || '';
    const keyword = ctx.params.keyword || '';

    switch (type) {
        case 'event':
            ctx.state.data = {
                title: `${TITLE} - 搜索: ${keyword}`,
                link: HOST,
                item: await fetchActivityList({ keyword }).then(({ items }) => items),
            };
            break;
        case 'artist':
            ctx.state.data = {
                title: `${TITLE} - 搜索: ${keyword}`,
                link: HOST,
                item: await fetchPerformerList({ searchKeyword: keyword }).then(({ items }) => items),
            };
            break;
        case 'brand':
            ctx.state.data = {
                title: `${TITLE} - 搜索: ${keyword}`,
                link: HOST,
                item: await fetchBrandList({ searchKeyword: keyword }).then(({ items }) => items),
            };
            break;
        case 'city':
            ctx.state.data = {
                title: `${TITLE} - 搜索: ${keyword}`,
                link: HOST,
                item: await fetchCityList(keyword),
            };
            break;
        case 'style':
            ctx.state.data = {
                title: `${TITLE} - 搜索: ${keyword}`,
                link: HOST,
                item: await fetchStyleList(keyword),
            };
            break;
        default:
            ctx.state.data = {
                title: `${TITLE} - 搜索: ${type}`,
                link: HOST,
                item: await fetchActivityList({ keyword: type }).then(({ items }) => items),
            };
    }
};
