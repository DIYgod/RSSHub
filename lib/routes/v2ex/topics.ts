import { z } from 'zod';

import { defineRoute, ViewType } from '@/types';
import { ofetch, parseDate } from '@/utils';

import type { Topic } from './types';

const topics = {
    hot: '最热主题',
    latest: '最新主题',
} as const;

export const route = defineRoute({
    path: '/topics/:type',
    param: z.object({
        type: z.union((Object.keys(topics) as Array<keyof typeof topics>).map((key) => z.literal(key).describe(topics[key]))).describe('主题类型'),
    }),
    categories: ['bbs'],
    view: ViewType.Articles,
    example: '/v2ex/topics/latest',
    name: '最热 / 最新主题',
    maintainers: ['WhiteWorld', 'hyoban'],
    async handler(ctx) {
        const { type } = ctx.req.valid('param');
        const title = topics[type];
        const data = (await ofetch(`https://www.v2ex.com/api/topics/${type}.json`)) as Array<Topic>;

        return {
            title: `V2EX-${title}`,
            link: 'https://www.v2ex.com/',
            description: `V2EX-${title}`,
            item: data.map((item) => ({
                title: item.title,
                description: `${item.member.username}: ${item.content_rendered}`,
                content: { text: item.content, html: item.content_rendered },
                pubDate: parseDate(item.created, 'X'),
                link: item.url,
                author: item.member.username,
                comments: item.replies,
                category: [item.node.title],
            })),
        };
    },
});
