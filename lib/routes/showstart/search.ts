import { Data, Route } from '@/types';
import { TITLE, HOST } from './const';
import { fetchActivityList, fetchPerformerList, fetchSiteList, fetchBrandList, fetchCityList, fetchStyleList } from './service';
import type { Context } from 'hono';

export const route: Route = {
    path: '/search/:type?/:keyword?',
    categories: ['shopping'],
    example: '/showstart/search/live',
    parameters: {
        keyword: '搜索关键词',
        type: {
            description: '类别',
            options: [
                {
                    value: 'event',
                    label: '演出',
                },
                {
                    value: 'artist',
                    label: '音乐人',
                },
                {
                    value: 'site',
                    label: '场地',
                },
                {
                    value: 'brand',
                    label: '厂牌',
                },
                {
                    value: 'city',
                    label: '城市',
                },
                {
                    value: 'style',
                    label: '风格',
                },
            ],
        },
    },
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

async function handler(ctx: Context): Promise<Data> {
    const type = ctx.req.param('type') || '';
    const keyword = ctx.req.param('keyword') || '';

    let items;
    let title;
    switch (type) {
        case 'event':
            title = `${TITLE} - 搜演出 - ${keyword || '全部'}`;
            items = await fetchActivityList({ keyword });
            break;
        case 'artist':
            title = `${TITLE} - 搜艺人 - ${keyword || '全部'}`;
            items = await fetchPerformerList({ searchKeyword: keyword });
            break;
        case 'site':
            title = `${TITLE} - 搜场地 - ${keyword || '全部'}`;
            items = await fetchSiteList({ searchKeyword: keyword });
            break;
        case 'brand':
            title = `${TITLE} - 搜厂牌 - ${keyword || '全部'}`;
            items = await fetchBrandList({ searchKeyword: keyword });
            break;
        case 'city':
            title = `${TITLE} - 搜城市 - ${keyword || '全部'}`;
            items = await fetchCityList(keyword);
            break;
        case 'style':
            title = `${TITLE} - 搜风格 - ${keyword || '全部'}`;
            items = await fetchStyleList(keyword);
            break;
        default:
            title = `${TITLE} - 搜演出 - ${type || '全部'}`;
            items = await fetchActivityList({ keyword: type });
    }
    return {
        title,
        link: HOST,
        allowEmpty: true,
        language: 'zh-CN',
        item: items,
    };
}
