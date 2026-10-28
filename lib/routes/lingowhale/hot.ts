import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { apiUrl, baseUrl, fetchEntries, parseChannel, parseTopic } from './utils';

export const route: Route = {
    path: '/hot/:type?',
    categories: ['new-media'],
    example: '/lingowhale/hot/2',
    parameters: {
        type: {
            description: 'Hot list type',
            options: [
                { value: '1', label: '热门频道' },
                { value: '2', label: '热门话题' },
                { value: '3', label: '热门文章' },
            ],
            default: '2',
        },
    },
    radar: [
        {
            source: ['lingowhale.com/topics'],
        },
    ],
    name: '热门',
    maintainers: ['TonyRL'],
    handler,
    url: 'lingowhale.com',
};

async function handler(ctx: Context) {
    const { type = '2' } = ctx.req.param();
    const { data } = await ofetch(`${apiUrl}/hot/list`, {
        query: { query_type: type },
    });

    if (type === '1') {
        return {
            title: '热门频道 - 语鲸',
            link: `${baseUrl}/channels`,
            item: data.channel.map((channel) => parseChannel(channel)),
        };
    }

    if (type === '3') {
        return {
            title: '热门文章 - 语鲸',
            link: `${baseUrl}/read`,
            item: await fetchEntries(data.article),
        };
    }

    return {
        title: '热门话题 - 语鲸',
        link: `${baseUrl}/topics`,
        item: data.topic.map((topic) => parseTopic(topic)),
    };
}
