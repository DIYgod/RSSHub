import type { Context } from 'hono';

import type { Data, Route } from '@/types';

import { HOST, TITLE } from './const';
import { fetchActivityList, fetchBrandList, fetchCityList, fetchPerformerList, fetchSiteList, fetchStyleList } from './service';

export const route: Route = {
    path: '/search/:type/:keyword?',
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

    switch (type) {
        case 'event':
            return {
                title: `${TITLE} - 搜演出 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchActivityList({ keyword }),
            };
        case 'artist':
            return {
                title: `${TITLE} - 搜艺人 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchPerformerList({ searchKeyword: keyword }),
            };
        case 'site':
            return {
                title: `${TITLE} - 搜场地 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchSiteList({ searchKeyword: keyword }),
            };
        case 'brand':
            return {
                title: `${TITLE} - 搜厂牌 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchBrandList({ searchKeyword: keyword }),
            };
        case 'city':
            return {
                title: `${TITLE} - 搜城市 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchCityList(keyword),
            };
        case 'style':
            return {
                title: `${TITLE} - 搜风格 - ${keyword || '全部'}`,
                link: HOST,
                item: await fetchStyleList(keyword),
            };
        default:
            return {
                title: `${TITLE} - 搜演出 - ${type || '全部'}`,
                link: HOST,
                allowEmpty: true,
                item: await fetchActivityList({ keyword: type }),
            };
    }
}
