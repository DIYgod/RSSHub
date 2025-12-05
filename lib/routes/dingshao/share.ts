import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Value } from './types';

export const route: Route = {
    path: '/share/:shortId',
    categories: ['other'],
    example: '/dingshao/share/FzFypN',
    parameters: {
        shortId: '频道 ID',
    },
    radar: [
        {
            source: ['www.dingshao.cn/share/:shortId'],
        },
    ],
    name: '频道',
    maintainers: ['TonyRL'],
    handler,
};

const baseUrl = 'https://www.dingshao.cn';

async function handler(ctx: Context) {
    const { shortId } = ctx.req.param();

    const response = await ofetch<Value>(`${baseUrl}/api/v2/channel/get-channel-and-recent-messages-by-short-id`, {
        method: 'POST',
        body: {
            shortId,
        },
    });

    const items = response.value.bundle.channelMessages.map((message) => ({
        title: message.excerpt.split('\n')[0],
        description: message.content,
        pubDate: parseDate(message.publishedAt),
        category: message.tags,
        link: `${baseUrl}/channel/${response.value.channel}/${message.id}`,
    }));

    const channelProfile = response.value.bundle.channels.find((channel) => channel.id === response.value.channel)?.profile;

    return {
        title: channelProfile?.name,
        description: channelProfile?.description,
        link: `${baseUrl}/share/${shortId}`,
        image: channelProfile?.image,
        item: items,
    };
}
