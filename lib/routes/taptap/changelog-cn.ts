import type { Route } from '@/types';

import { handler } from './common/changelog';

export const route: Route = {
    path: '/changelog/:id/:lang?',
    categories: ['game'],
    example: '/taptap/changelog/60809/en_US',
    parameters: {
        id: '游戏 ID，游戏主页 URL 中获取',
        lang: '语言，默认使用 `zh_CN`，亦可使用 `en_US`',
    },
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
            source: ['www.taptap.cn/app/:id'],
            target: '/changelog/:id',
        },
    ],
    name: '游戏更新',
    maintainers: ['hoilc', 'ETiV'],
    handler,
};
