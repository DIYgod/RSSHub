import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { fetchThreads } from './utils';

export const route: Route = {
    path: '/threads/forum/:forum_id',
    categories: ['bbs'],
    example: '/liyuans/threads/forum/1',
    parameters: { forum_id: '板块 ID, 支持多个, 使用英文逗号分隔' },
    name: '主题帖（板块）',
    maintainers: ['WooMai'],
    handler,
};

async function handler(ctx: Context) {
    const { forum_id: forumId } = ctx.req.param();

    const feed = await fetchThreads('forum', forumId);

    if (!Number.isNaN(Number(forumId))) {
        const forumUrl = `https://api.forums.liyuans.com/forum/${forumId}`;
        const forum = await cache.tryGet(forumUrl, async () => {
            const { data } = await ofetch<{ data: { name: string; descr: string } }>(forumUrl);
            return data;
        });

        feed.title = `${forum.name} - 梨园`;
        feed.description = forum.descr;
    }

    return feed;
}
