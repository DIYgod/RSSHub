import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { apiUrl, baseUrl, fetchEntries, headers } from './utils';

export const route: Route = {
    path: '/channel/:id',
    categories: ['new-media'],
    example: '/lingowhale/channel/67cc08a19a4297b6148b297e',
    parameters: { id: 'Channel ID, found in the `channel_id` query of the channel page URL' },
    radar: [
        {
            source: ['lingowhale.com/channels'],
        },
    ],
    name: '频道',
    maintainers: ['TonyRL'],
    handler,
    url: 'lingowhale.com',
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const link = `${baseUrl}/channels?channel_id=${id}`;
    const limit = Number(ctx.req.query('limit') ?? 20);

    const [channel, feedResponse] = await Promise.all([
        cache.tryGet(`lingowhale:channel:${id}`, async () => {
            const response = await ofetch(`${apiUrl}/subscription_channel/get`, {
                method: 'POST',
                body: { channel_id: id },
            });
            return response.data.subscription_channel;
        }),
        ofetch(`${apiUrl}/feed/subscription`, {
            method: 'POST',
            headers,
            body: { channel_ids: [id], cursor: '', limit },
        }),
    ]);

    const items = await fetchEntries(feedResponse.data.feed_list);

    return {
        title: `${channel.name} - 语鲸`,
        description: channel.description,
        link,
        image: channel.surface_url,
        item: items,
    };
}
