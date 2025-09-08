import { Route } from '@/types';
import { handler } from './common/review';

export const route: Route = {
    path: '/review/:id/:order?/:lang?',
    categories: ['game'],
    example: '/taptap/review/142793/hot',
    parameters: {
        id: '游戏 ID，游戏主页 URL 中获取',
        order: '排序方式，空为综合，可选如下',
        lang: '语言，`zh-CN` 或 `zh-TW`，默认为 `zh-CN`',
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
            source: ['www.taptap.cn/app/:id/review', 'www.taptap.cn/app/:id'],
            target: '/review/:id',
        },
    ],
    name: '游戏评价',
    maintainers: ['hoilc', 'TonyRL'],
    handler,
    description: `| 最新   | 综合 |
| --- | --- |
| new | hot |`,
};
