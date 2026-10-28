import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const md = MarkdownIt();

export const route: Route = {
    path: '/',
    categories: ['bbs'],
    example: '/hackertalk',
    radar: [
        {
            source: ['hackertalk.net/'],
            target: '',
        },
    ],
    name: '最新帖子',
    maintainers: ['hyoban'],
    handler,
    url: 'hackertalk.net/',
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 25);

    const response = await got(`https://api-beta.hackertalk.net/v1/posts?limit=${limit}&orderBy=time`);

    const data = response.data.data;

    return {
        title: '黑客说的最新帖子',
        link: 'https://hackertalk.net/?tab=new',
        description: '黑客说 - 技术驱动优质交流',
        item: data.map((item) => {
            const pubDate = ([undefined, null, ''] as unknown[]).includes(item.createdAt) ? undefined : parseDate(item.createdAt);
            return {
                title: item.title,
                description: md.render(item.content),
                pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                author: item.from?.nickname || item.from?.username,
                link: `https://hackertalk.net/posts/${item.id}`,
            };
        }),
    };
}
