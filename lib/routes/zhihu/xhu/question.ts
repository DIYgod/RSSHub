// @ts-nocheck
import got from '@/utils/got';
const auth = require('./auth');
const utils = require('../utils');
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const xhuCookie = await auth.getCookie(ctx);
    const {
        questionId,
        sortBy = 'default', // default,created,updated
    } = ctx.req.param();
    const link = `https://www.zhihu.com/question/${questionId}`;
    const url = `https://api.zhihuvvv.workers.dev/questions/${questionId}/answers?limit=20&offest=0&order_by=${sortBy}`;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'https://api.zhihuvvv.workers.dev',
            Cookie: xhuCookie,
        },
    });
    const listRes = response.data.data;

    ctx.set('data', {
        title: `知乎-${listRes[0].question.title}`,
        link,
        item: listRes.map((item) => {
            const link = `https://www.zhihu.com/question/${questionId}/answer/${item.id}`;
            const author = item.author.name;
            const title = `${author}的回答：${item.excerpt}`;
            const description = `${author}的回答<br/><br/>${utils.ProcessImage(item.excerpt)}`;

            return {
                title,
                description,
                author,
                pubDate: parseDate(item.updated_time * 1000),
                guid: link,
                link,
            };
        }),
    });
};
