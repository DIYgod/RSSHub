import type { Route } from '@/types';

import { processFeed } from './utils';

const handler = (ctx) => processFeed('author', ctx);

export const route: Route = {
    path: '/author/:type/:language?',
    name: '作者',
    url: 'theinitium.com',
    maintainers: ['AgFlore'],
    parameters: {
        type: '作者 slug，可从作者主页 URL 中获取，如 `https://theinitium.com/author/initium-newsroom/`',
        language: '语言，简体`zh-hans`，繁体`zh-hant`，缺省为不限',
    },
    features: {
        requireConfig: [
            {
                name: 'INITIUM_MEMBER_COOKIE',
                optional: true,
                description: '端传媒会员登录后的 Cookie，用于获取付费文章全文。',
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
            source: ['theinitium.com/author/:type'],
            target: '/author/:type',
        },
    ],
    handler,
    example: '/theinitium/author/initium-newsroom',
    categories: ['new-media'],
};
