import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchThreads } from './utils';

export const route: Route = {
    path: '/threads/user/:user_id',
    categories: ['bbs'],
    example: '/liyuans/threads/user/1',
    parameters: { user_id: '用户 ID (仅支持数字 ID), 支持多个, 使用英文逗号分隔' },
    name: '主题帖（用户）',
    maintainers: ['WooMai'],
    handler,
};

async function handler(ctx: Context) {
    const { user_id: userId } = ctx.req.param();

    return await fetchThreads('user', userId);
}
