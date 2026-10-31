import type { Route } from '@/types';

import { feedDescription, getFeed } from './utils';

export const route: Route = {
    path: '/hot',
    name: '热门帖子',
    categories: ['bbs'],
    example: '/viva-la-vita/hot',
    maintainers: ['0zheermao0'],
    description: `对应论坛“热门”，按评论总数倒序排列，为全站累计热门榜，不是近期热度榜。${feedDescription}`,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        nsfw: true,
    },
    radar: [
        {
            source: ['bbs.viva-la-vita.org/', 'bbs.viva-la-vita.org/all'],
            target: '/hot',
        },
    ],
    handler: () => getFeed('hot'),
};
