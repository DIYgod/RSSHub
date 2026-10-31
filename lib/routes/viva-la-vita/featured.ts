import type { Route } from '@/types';

import { feedDescription, getFeed } from './utils';

export const route: Route = {
    path: '/featured',
    name: '精华帖子',
    categories: ['bbs'],
    example: '/viva-la-vita/featured',
    maintainers: ['0zheermao0'],
    description: `对应论坛“精华”，仅返回加精主题，按加精日期倒序排列，不是置顶主题。${feedDescription}`,
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
            target: '/featured',
        },
    ],
    handler: () => getFeed('featured'),
};
