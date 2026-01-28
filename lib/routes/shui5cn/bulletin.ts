import type { Route } from '@/types';

import { fetchShui5cnCategory } from './utils';

export const route: Route = {
    path: '/bulletin',
    categories: ['finance'],
    example: '/shui5cn/bulletin',
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
            source: ['shui5.cn/article/Bulletin/'],
            target: '/bulletin',
        },
    ],
    name: '公告',
    maintainers: ['anuxs'],
    handler,
    url: 'shui5.cn/article/Bulletin/',
};

async function handler() {
    return await fetchShui5cnCategory({
        categoryPath: 'Bulletin',
        categoryName: '公告',
        categoryLabel: '公告',
    });
}
