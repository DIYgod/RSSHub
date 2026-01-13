import type { Route } from '@/types';

import { fetchShui5cnCategory } from './utils';

export const route: Route = {
    path: '/difang-caishui-fagui',
    categories: ['finance'],
    example: '/shui5cn/difang-caishui-fagui',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['shui5.cn/article/DiFangCaiShuiFaGui/'],
            target: '/difang-caishui-fagui',
        },
    ],
    name: '地方财税法规',
    maintainers: ['anuxs'],
    handler,
    url: 'shui5.cn/article/DiFangCaiShuiFaGui/',
};

async function handler() {
    return await fetchShui5cnCategory({
        categoryPath: 'DiFangCaiShuiFaGui',
        categoryName: '地方财税法规',
        categoryLabel: '地方财税法规',
    });
}
