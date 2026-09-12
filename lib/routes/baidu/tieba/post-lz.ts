import type { Context } from 'hono';

import type { Route } from '@/types';

import { getPostFeed } from './post';

export const route: Route = {
    path: '/tieba/post/lz/:id',
    categories: ['bbs'],
    example: '/baidu/tieba/post/lz/686961453',
    parameters: { id: '帖子 ID' },
    features: {
        requireConfig: [
            {
                name: 'BAIDU_COOKIE',
                optional: true,
                description: '百度 cookie 值，用于需要登录的贴吧页面',
            },
        ],
        antiCrawler: true,
    },
    name: '楼主动态',
    maintainers: ['u3u', 'FlanChanXwO'],
    handler,
};

function handler(ctx: Context) {
    const { id } = ctx.req.param();
    return getPostFeed(id, 1);
}
