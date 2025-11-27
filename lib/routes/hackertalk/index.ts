import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt();

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['hackertalk.net/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['hyoban'],
    handler,
    url: 'hackertalk.net/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ?? 25;

    const response = await got(`https://api.hackertalk.net/v1/posts?limit=${limit}&orderBy=time`);

    const data = response.data.data;

    return {
        title: '黑客说的最新帖子',
        link: 'https://hackertalk.net/?tab=new',
        description: '黑客说 - 技术驱动优质交流',
        item: data.map((item) => ({
            title: item.title,
            description: md.render(item.content),
            pubDate: parseDate(item.createdAt),
            link: `https://hackertalk.net/posts/${item.id}`,
        })),
    };
}
