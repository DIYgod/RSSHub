import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { apiUrl, baseUrl, fetchEntries, parseChannel, parseTopic } from './utils';

export const route: Route = {
    path: '/search/:keyword/:type?',
    categories: ['new-media'],
    example: '/lingowhale/search/F1',
    parameters: {
        keyword: 'Search keyword',
        type: {
            description: 'Search type',
            options: [
                { value: '1', label: '频道' },
                { value: '2', label: '话题' },
                { value: '3', label: '文章' },
            ],
            default: '1',
        },
    },
    radar: [
        {
            source: ['lingowhale.com/channels'],
        },
    ],
    name: '搜索',
    maintainers: ['TonyRL'],
    handler,
    url: 'lingowhale.com',
};

async function handler(ctx: Context) {
    const { keyword, type = '1' } = ctx.req.param();
    const { data } = await ofetch(`${apiUrl}/search`, {
        method: 'POST',
        body: { query_type: Number(type), query: keyword, cursor: '' },
    });

    if (type === '2') {
        return {
            title: `${keyword} - 话题搜索 - 语鲸`,
            link: `${baseUrl}/topics`,
            item: data.topics.map((topic) => parseTopic(topic)),
        };
    }

    if (type === '3') {
        return {
            title: `${keyword} - 文章搜索 - 语鲸`,
            link: `${baseUrl}/read`,
            item: await fetchEntries(data.articles),
        };
    }

    return {
        title: `${keyword} - 频道搜索 - 语鲸`,
        link: `${baseUrl}/channels`,
        item: data.channels.map((channel) => parseChannel(channel)),
    };
}
