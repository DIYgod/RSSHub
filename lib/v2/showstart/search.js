const { TITLE, HOST } = require('./const');
const { fetchActivityList, fetchPerformerList, fetchBrandList, fetchCityList, fetchStyleList } = require('./service');

module.exports = async (ctx) => {
    const type = ctx.params.type || '';
    const keyword = ctx.params.keyword || '';

    switch (type) {
        case 'event':
            ctx.state.data = {
                title: `${TITLE} - 搜演出 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchActivityList({ keyword }),
            };
            break;
        case 'artist':
            ctx.state.data = {
                title: `${TITLE} - 搜艺人 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchPerformerList({ searchKeyword: keyword }),
            };
            break;
        case 'brand':
            ctx.state.data = {
                title: `${TITLE} - 搜厂牌 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchBrandList({ searchKeyword: keyword }),
            };
            break;
        case 'city':
            ctx.state.data = {
                title: `${TITLE} - 搜城市 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchCityList(keyword),
            };
            break;
        case 'style':
            ctx.state.data = {
                title: `${TITLE} - 搜风格 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchStyleList(keyword),
            };
            break;
        default:
            ctx.state.data = {
                title: `${TITLE} - 搜演出 - ${type || '全部'}`,
                link: HOST,
                item: await fetchActivityList({ keyword: type }),
            };
    }
};
