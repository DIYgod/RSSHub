import type { Route } from '@/types';

import { fetchShui5cnCategory } from './utils';

export const route: Route = {
    path: '/shuishou-youhui',
    categories: ['finance'],
    example: '/shui5cn/shuishou-youhui',
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
            source: ['shui5.cn/article/ShuiShouYouHui/'],
            target: '/shuishou-youhui',
        },
    ],
    name: '税收优惠',
    maintainers: ['anuxs'],
    handler,
    url: 'shui5.cn/article/ShuiShouYouHui/',
};

async function handler() {
    return await fetchShui5cnCategory({
        categoryPath: 'ShuiShouYouHui',
        categoryName: '税收优惠',
        categoryLabel: '税收优惠',
    });
}
