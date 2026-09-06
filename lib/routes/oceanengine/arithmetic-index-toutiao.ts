import type { Route } from '@/types';

import { handler } from './arithmetic-index';

export const route: Route = {
    path: '/index/:keyword/toutiao',
    categories: ['other'],
    example: '/oceanengine/index/教材/toutiao',
    parameters: {
        keyword: '热点关键词',
    },
    description: '爬取巨量算数近 6 个月的头条指数，解密后提取指数波峰当日的热门搜索关键词，生成为 RSS。可用于追踪新闻热点事件。',
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    name: '头条指数波峰',
    maintainers: ['Jkker'],
    handler,
};
