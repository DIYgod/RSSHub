import type { Route } from '@/types';

import { fetchShui5cnCategory } from './utils';

export const route: Route = {
    path: '/shuiwu-wenda',
    categories: ['finance'],
    example: '/shui5cn/shuiwu-wenda',
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
            source: ['shui5.cn/article/ShuiWuWenDa/'],
            target: '/shuiwu-wenda',
        },
    ],
    name: '税务问答',
    maintainers: ['anuxs'],
    handler,
    url: 'shui5.cn/article/ShuiWuWenDa/',
};

async function handler() {
    return await fetchShui5cnCategory({
        categoryPath: 'ShuiWuWenDa',
        categoryName: '税务问答',
        categoryLabel: '税务问答',
    });
}
