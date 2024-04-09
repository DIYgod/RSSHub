import { Route } from '@/types';
import { TITLE, HOST } from './const';
import { fetchActivityList, fetchPerformerList, fetchBrandList, fetchCityList, fetchStyleList } from './service';

export const route: Route = {
    path: '/search/:type/:keyword?',
    categories: ['shopping'],
    example: '/showstart/search/live',
    parameters: { type: '类别', keyword: '搜索关键词' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '演出搜索',
    maintainers: ['lchtao26'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || '';
    const keyword = ctx.req.param('keyword') || '';

    switch (type) {
        case 'event':
            return {
                title: `${TITLE} - 搜演出 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchActivityList({ keyword }),
            };
            break;
        case 'artist':
            return {
                title: `${TITLE} - 搜艺人 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchPerformerList({ searchKeyword: keyword }),
            };
            break;
        case 'brand':
            return {
                title: `${TITLE} - 搜厂牌 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchBrandList({ searchKeyword: keyword }),
            };
            break;
        case 'city':
            return {
                title: `${TITLE} - 搜城市 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchCityList(keyword),
            };
            break;
        case 'style':
            return {
                title: `${TITLE} - 搜风格 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchStyleList(keyword),
            };
            break;
        default:
            return {
                title: `${TITLE} - 搜演出 - ${type || '全部'}`,
                link: HOST,
                item: await fetchActivityList({ keyword: type }),
            };
    }
}
