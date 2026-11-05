import type { Route } from '@/types';

import { getContent } from './utils/common';

export const route: Route = {
    path: '/jwc/:category?',
    categories: ['university'],
    example: '/hunau/jwc',
    parameters: { category: '页面分类，默认为 `tzgg`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jwc.hunau.edu.cn/'],
            target: '/jwc',
        },
        {
            source: ['jwc.hunau.edu.cn/tzgg', 'jwc.hunau.edu.cn/tzgg/index.html'],
            target: '/jwc',
        },
        {
            source: ['jwc.hunau.edu.cn/jwdt', 'jwc.hunau.edu.cn/jwdt/index.html'],
            target: '/jwc/jwdt',
        },
    ],
    name: '教务处',
    maintainers: ['lcandy2'],
    handler,
    url: 'jwc.hunau.edu.cn/',
    description: `| 分类 | 通知公告 | 教务动态 | 其他教务通知... |
| ---- | -------- | -------- | --------------- |
| 参数 | tzgg     | jwdt     | 对应 URL        |`,
};

async function handler(ctx) {
    return await getContent(ctx, {
        baseHost: 'https://jwc.hunau.edu.cn',
        baseCategory: 'tzgg', // Default: notices
        baseTitle: '湖南农业大学教务处',
        baseDeparment: 'jwc',
        baseClass: 'main .collection .single_one:has(a)',
    });
}
