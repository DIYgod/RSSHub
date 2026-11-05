import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { apiUrl, baseUrl, fetchEntries, headers } from './utils';

export const route: Route = {
    path: '/topic/:id',
    categories: ['new-media'],
    example: '/lingowhale/topic/6ace33a60c047819650365b1',
    parameters: { id: 'Topic ID, found in the `topic_id` query of the topic page URL' },
    radar: [
        {
            source: ['lingowhale.com/topics'],
        },
    ],
    name: '话题',
    maintainers: ['TonyRL'],
    handler,
    url: 'lingowhale.com',
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const link = `${baseUrl}/topics?topic_id=${id}`;
    const limit = Number(ctx.req.query('limit') ?? 20);

    const [topic, feedResponse] = await Promise.all([
        cache.tryGet(`lingowhale:topic:${id}`, async () => {
            const response = await ofetch(`${apiUrl}/topic/get`, {
                method: 'POST',
                body: { topic_id: id },
            });
            return response.data.topic;
        }),
        ofetch(`${apiUrl}/feed/topic`, {
            method: 'POST',
            headers,
            body: { topic_id: id, cursor: '', limit },
        }),
    ]);

    const items = await fetchEntries(feedResponse.data.feed_list);

    return {
        title: `${topic.name} - 语鲸`,
        description: topic.hook,
        link,
        image: topic.surface_url,
        item: items,
    };
}
