import type { Route } from '@/types';

import { processFeed } from './utils';

const handler = (ctx) => processFeed('tags', ctx);

export const route: Route = {
    path: '/tags/:type/:language?',
    name: '话题・标签',
    url: 'theinitium.com',
    maintainers: ['AgFlore'],
    parameters: {
        type: '标签 slug，可从标签页 URL 中获取，如 `https://theinitium.com/tag/south-korea/` 则为 `south-korea`',
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
            source: ['theinitium.com/tag/:type'],
            target: '/tags/:type',
        },
    ],
    handler,
    example: '/theinitium/tags/south-korea',
    categories: ['new-media'],
};
