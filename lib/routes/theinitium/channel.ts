import type { Route } from '@/types';

import { processFeed } from './utils';

const handler = (ctx) => processFeed('channel', ctx);

export const route: Route = {
    path: '/channel/:type?/:language?',
    name: '栏目',
    url: 'theinitium.com',
    maintainers: ['prnake', 'mintyfrankie'],
    parameters: {
        type: '栏目，缺省为最新（latest）',
        language: '语言，简体`zh-hans`，繁体`zh-hant`，缺省为不限',
    },
    features: {
        requireConfig: [
            {
                name: 'INITIUM_MEMBER_COOKIE',
                optional: true,
                description: '端传媒会员登录后的 Cookie，用于获取付费文章全文。获取方式：登录 theinitium.com 后，从浏览器开发者工具中复制 Cookie。',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['theinitium.com/latest/'],
            target: '/channel/latest',
        },
        {
            source: ['theinitium.com/tag/:type'],
            target: '/channel/:type',
        },
    ],
    handler,
    example: '/theinitium/channel/latest',
    categories: ['new-media'],
    description: `Type 栏目（对应 Ghost 标签）：

| 最新   | 速递     | 评论    | 国际          | 大陆     | 香港     | 台湾   | 科技       | 专题   | 日报        | 周报   |
| ------ | -------- | ------- | ------------- | -------- | -------- | ------ | ---------- | ------ | ----------- | ------ |
| latest | whatsnew | opinion | international | mainland | hongkong | taiwan | technology | feature | daily-brief | weekly |

:::tip
设置环境变量 \`INITIUM_MEMBER_COOKIE\` 可获取付费文章全文。
:::`,
};
