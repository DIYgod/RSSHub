import type { Route } from '@/types';

import { feedDescription, getFeed } from './utils';

export const route: Route = {
    path: '/latest',
    name: '最新帖子',
    categories: ['bbs'],
    example: '/viva-la-vita/latest',
    maintainers: ['0zheermao0'],
    description: `按主题创建时间倒序排列。${feedDescription}`,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        nsfw: true,
    },
    radar: [
        {
            source: ['bbs.viva-la-vita.org/', 'bbs.viva-la-vita.org/all', 'bbs.viva-la-vita.org/d/:id'],
            target: '/latest',
        },
    ],
    handler: () => getFeed('latest'),
};
