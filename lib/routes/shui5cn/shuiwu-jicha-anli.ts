import type { Route } from '@/types';

import { fetchShui5cnCategory } from './utils';

export const route: Route = {
    path: '/shuiwu-jicha-anli',
    categories: ['finance'],
    example: '/shui5cn/shuiwu-jicha-anli',
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
            source: ['shui5.cn/article/ShuiWuJiChaAnLi/'],
            target: '/shuiwu-jicha-anli',
        },
    ],
    name: '税务稽查案例',
    maintainers: ['anuxs'],
    handler,
    url: 'shui5.cn/article/ShuiWuJiChaAnLi/',
};

async function handler() {
    return await fetchShui5cnCategory({
        categoryPath: 'ShuiWuJiChaAnLi',
        categoryName: '税务稽查案例',
        categoryLabel: '税务稽查',
    });
}
