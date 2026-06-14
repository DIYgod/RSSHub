import type { Route } from '@/types';

import { handler } from './cs';

export const route: Route = {
    path: '/ces/:type?',
    categories: ['university'],
    example: '/shu/ces/zytz',
    parameters: { type: '分类，默认为重要通知' },
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
            source: ['cs.shu.edu.cn/', 'cs.shu.edu.cn/index/zytz.htm'],
            target: '/ces/zytz',
        },
    ],
    name: '计算机工程与科学学院（CES 兼容）',
    maintainers: ['GhhG123', 'linull24'],
    handler,
    url: 'cs.shu.edu.cn/',
    description: `本路由与 \`/shu/cs/:type?\` 使用同一后端。

| 重要通知 |
| -------- |
| zytz     |`,
};
