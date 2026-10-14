import type { Route } from '@/types';

import { getContent } from '../utils/common';

export const route: Route = {
    path: '/xky/:category?',
    categories: ['university'],
    example: '/hunau/xky',
    parameters: { category: '页面分类，默认为 `tzgg_8472`' },
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
            source: ['xky.hunau.edu.cn/'],
            target: '/xky',
        },
        {
            source: ['xky.hunau.edu.cn/tzgg_8472', 'xky.hunau.edu.cn/tzgg_8472/index.html'],
            target: '/xky',
        },
    ],
    name: '信息与智能科学技术学院',
    maintainers: ['lcandy2'],
    handler,
    url: 'xky.hunau.edu.cn/',
    description: `| 分类 | 通知公告   | 学院新闻 | 其他分类通知... |
| ---- | ---------- | -------- | --------------- |
| 参数 | tzgg\\_8472 | xyxw     | 对应 URL        |`,
};

async function handler(ctx) {
    return await getContent(ctx, {
        baseHost: 'https://xky.hunau.edu.cn',
        baseCategory: 'tzgg_8472', // Default: notices
        baseTitle: '信息与智能科学技术学院',
        baseDescription: '湖南农业大学信息与智能科学技术学院',
        baseDeparment: 'xky',
        baseClass: 'div.right_list ul li:has(a)',
    });
}
