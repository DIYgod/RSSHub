import type { Route } from '@/types';

import { fetchShui5cnCategory } from './utils';

export const route: Route = {
    path: '/niandu-caishui-fagui',
    categories: ['finance'],
    example: '/shui5cn/niandu-caishui-fagui',
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
            source: ['shui5.cn/article/NianDuCaiShuiFaGui/'],
            target: '/niandu-caishui-fagui',
        },
    ],
    name: '年度财税法规',
    maintainers: ['anuxs'],
    handler,
    url: 'shui5.cn/article/NianDuCaiShuiFaGui/',
};

async function handler() {
    return await fetchShui5cnCategory({
        categoryPath: 'NianDuCaiShuiFaGui',
        categoryName: '年度财税法规',
        categoryLabel: '年度财税法规',
    });
}
