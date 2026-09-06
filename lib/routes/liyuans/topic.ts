import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { fetchThreads } from './utils';

export const route: Route = {
    path: '/threads/topic/:topic_id',
    categories: ['bbs'],
    example: '/liyuans/threads/topic/1',
    parameters: { topic_id: '专题 ID, 支持多个, 使用英文逗号分隔' },
    name: '主题帖（专题）',
    maintainers: ['WooMai'],
    handler,
};

async function handler(ctx: Context) {
    const { topic_id: topicId } = ctx.req.param();

    const feed = await fetchThreads('topic', topicId);

    if (!Number.isNaN(Number(topicId))) {
        const topicUrl = `https://api.forums.liyuans.com/topic/${topicId}`;
        const topic = await cache.tryGet(topicUrl, async () => {
            const { data } = await ofetch<{ data: { name: string; descr: string } }>(topicUrl);
            return data;
        });

        feed.title = `${topic.name} - 梨园`;
        feed.description = topic.descr;
    }

    return feed;
}
