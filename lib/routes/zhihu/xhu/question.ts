import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { processImage } from '../utils';
import auth from './auth';

export const route: Route = {
    path: '/xhu/question/:questionId/:sortBy?',
    categories: ['social-media'],
    example: '/zhihu/xhu/question/264051433',
    parameters: { questionId: '问题 id', sortBy: '排序方式：`default`, `created`, `updated`。默认为 `default`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.zhihu.com/question/:questionId'],
            target: '/xhu/question/:questionId',
        },
    ],
    name: 'xhu - 问题',
    maintainers: ['JimenezLi'],
    handler,
};

async function handler(ctx) {
    const xhuCookie = await auth.getCookie();
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

    return {
        title: `知乎-${listRes[0].question.title}`,
        link,
        item: listRes.map((item) => {
            const link = `https://www.zhihu.com/question/${questionId}/answer/${item.id}`;
            const author = item.author.name;
            const title = `${author}的回答：${item.excerpt}`;
            const description = `${author}的回答<br/><br/>${processImage(item.excerpt)}`;

            return {
                title,
                description,
                author,
                pubDate: parseDate(item.updated_time * 1000),
                guid: link,
                link,
            };
        }),
    };
}
