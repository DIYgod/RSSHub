import type { Route } from '@/types';

import { fetchShui5cnCategory } from './utils';

export const route: Route = {
    path: '/nashui-tiaozhen',
    categories: ['finance'],
    example: '/shui5cn/nashui-tiaozhen',
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
            source: ['shui5.cn/article/NaShuiTiaoZhen/'],
            target: '/nashui-tiaozhen',
        },
    ],
    name: '纳税调整',
    maintainers: ['anuxs'],
    handler,
    url: 'shui5.cn/article/NaShuiTiaoZhen/',
};

async function handler() {
    return await fetchShui5cnCategory({
        categoryPath: 'NaShuiTiaoZhen',
        categoryName: '纳税调整',
        categoryLabel: '纳税调整',
    });
}
