// @ts-nocheck
import got from '@/utils/got';
const auth = require('./auth');
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const xhuCookie = await auth.getCookie(ctx);
    const hexId = ctx.req.param('hexId');
    const link = `https://www.zhihu.com/people/${hexId}/answers`;
    const url = `https://api.zhihuvvv.workers.dev/people/${hexId}/answers?limit=20&offset=0`;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'https://api.zhihuvvv.workers.dev',
            Cookie: xhuCookie,
        },
    });
    const data = response.data.data;

    ctx.set('data', {
        title: `${data[0].author.name}的知乎回答`,
        link,
        item: data.map((item) => ({
            title: item.question.title,
            description: item.excerpt,
            pubDate: parseDate(item.created_time * 1000),
            link: `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`,
        })),
    });
};
