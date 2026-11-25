import type { Route } from '@/types';

import { getContent } from '../utils/common';

export const route: Route = {
    path: '/gfxy/:category?',
    categories: ['university'],
    example: '/hunau/gfxy',
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
            source: ['gfxy.hunau.edu.cn/'],
            target: '/gfxy',
        },
        {
            source: ['gfxy.hunau.edu.cn/tzgg_0', 'gfxy.hunau.edu.cn/tzgg_0/index.html'],
            target: '/gfxy',
        },
        {
            source: ['gfxy.hunau.edu.cn/xyyw', 'gfxy.hunau.edu.cn/xyyw/index.html'],
            target: '/gfxy/xyyw',
        },
    ],
    name: '公共管理与法学学院',
    maintainers: ['lcandy2'],
    handler,
    url: 'gfxy.hunau.edu.cn/',
    description: `| 分类 | 通知公告 | 学院要闻 | 其他分类通知... |
| ---- | -------- | -------- | --------------- |
| 参数 | tzgg     | xyyw     | 对应 URL        |`,
};

async function handler(ctx) {
    return await getContent(ctx, {
        baseHost: 'https://gfxy.hunau.edu.cn',
        baseCategory: 'tzgg', // Default: notices
        baseTitle: '公共管理与法学学院',
        baseDescription: '湖南农业大学公共管理与法学学院',
        baseDeparment: 'gfxy',
        baseClass: 'div.right_list ul li:has(a)',
    });
}
