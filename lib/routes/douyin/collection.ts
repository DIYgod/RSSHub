import type { Route } from '@/types';

import { getSavedPosts } from './saved-posts';

export const route: Route = {
    path: '/collection',
    name: '收藏的视频',
    example: '/douyin/collection',
    categories: ['social-media'],
    maintainers: ['DIYgod'],
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
        requireConfig: [{ name: 'DOUYIN_COOKIE', description: '对应允许用于订阅的本人账号。' }],
    },
    description: '订阅 DOUYIN_COOKIE 对应账号收藏的视频首屏。收藏夹、音乐、合集和短剧不在此路由范围内。发布时间为视频原始发布时间，收藏时间没有公开提供。',
    handler: () => getSavedPosts('collection', 'self'),
};
