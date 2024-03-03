// @ts-nocheck
const { TITLE, HOST } = require('./const');
const { fetchActivityList, fetchPerformerList, fetchBrandList, fetchCityList, fetchStyleList } = require('./service');

export default async (ctx) => {
    const type = ctx.req.param('type') || '';
    const keyword = ctx.req.param('keyword') || '';

    switch (type) {
        case 'event':
            ctx.set('data', {
                title: `${TITLE} - 搜演出 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchActivityList({ keyword }),
            });
            break;
        case 'artist':
            ctx.set('data', {
                title: `${TITLE} - 搜艺人 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchPerformerList({ searchKeyword: keyword }),
            });
            break;
        case 'brand':
            ctx.set('data', {
                title: `${TITLE} - 搜厂牌 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchBrandList({ searchKeyword: keyword }),
            });
            break;
        case 'city':
            ctx.set('data', {
                title: `${TITLE} - 搜城市 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchCityList(keyword),
            });
            break;
        case 'style':
            ctx.set('data', {
                title: `${TITLE} - 搜风格 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchStyleList(keyword),
            });
            break;
        default:
            ctx.set('data', {
                title: `${TITLE} - 搜演出 - ${type || '全部'}`,
                link: HOST,
                item: await fetchActivityList({ keyword: type }),
            });
    }
};
