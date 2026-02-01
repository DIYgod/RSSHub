import type { Route } from '@/types';

import { fetchShui5cnCategory } from './utils';

export const route: Route = {
    path: '/nashui-pinggu',
    categories: ['finance'],
    example: '/shui5cn/nashui-pinggu',
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
            source: ['shui5.cn/article/NaShuiPingGu/'],
            target: '/nashui-pinggu',
        },
    ],
    name: '纳税评估',
    maintainers: ['anuxs'],
    handler,
    url: 'shui5.cn/article/NaShuiPingGu/',
};

async function handler() {
    return await fetchShui5cnCategory({
        categoryPath: 'NaShuiPingGu',
        categoryName: '纳税评估',
        categoryLabel: '纳税评估',
    });
}
