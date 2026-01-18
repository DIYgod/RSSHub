import type { Route } from '@/types';

import { fetchShui5cnCategory } from './utils';

export const route: Route = {
    path: '/shuiwu-chouhua',
    categories: ['finance'],
    example: '/shui5cn/shuiwu-chouhua',
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
            source: ['shui5.cn/article/ShuiWuChouHua/'],
            target: '/shuiwu-chouhua',
        },
    ],
    name: '税务筹划',
    maintainers: ['anuxs'],
    handler,
    url: 'shui5.cn/article/ShuiWuChouHua/',
};

async function handler() {
    return await fetchShui5cnCategory({
        categoryPath: 'ShuiWuChouHua',
        categoryName: '税务筹划',
        categoryLabel: '税务筹划',
    });
}
