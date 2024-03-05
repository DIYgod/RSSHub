// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt();

export default async (ctx) => {
    const limit = ctx.req.query('limit') ?? 25;

    const response = await got(`https://api.hackertalk.net/v1/posts?limit=${limit}&orderBy=time`);

    const data = response.data.data;

    ctx.set('data', {
        title: '黑客说的最新帖子',
        link: 'https://hackertalk.net/?tab=new',
        description: '黑客说 - 技术驱动优质交流',
        item: data.map((item) => ({
            title: item.title,
            description: md.render(item.content),
            pubDate: parseDate(item.createdAt),
            link: `https://hackertalk.net/posts/${item.id}`,
        })),
    });
};
