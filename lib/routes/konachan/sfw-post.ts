import type { Route } from '@/types';

import { route as popularPosts } from './post';

export const route: Route = {
    ...popularPosts,
    path: '/sfw/post/popular_recent/:period?',
    example: '/konachan/sfw/post/popular_recent/1d',
    radar: [{ source: ['konachan.net/post'], target: '/sfw/post/popular_recent' }],
    features: { nsfw: true },
};
