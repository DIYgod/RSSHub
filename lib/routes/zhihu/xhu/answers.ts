import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import auth from './auth';

export const route: Route = {
    path: '/xhu/people/answers/:hexId',
    categories: ['social-media'],
    example: '/zhihu/xhu/people/answers/246e6cf44e94cefbf4b959cb5042bc91',
    parameters: { hexId: '用户的 16 进制 id，获取方式同 [xhu - 用户动态](#zhi-hu-xhu-yong-hu-dong-tai)' },
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
            source: ['www.zhihu.com/people/:id/answers'],
            target: '/people/answers/:id',
        },
    ],
    name: 'xhu - 用户回答',
    maintainers: ['JimenezLi'],
    handler,
};

async function handler(ctx) {
    const xhuCookie = await auth.getCookie();
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

    return {
        title: `${data[0].author.name}的知乎回答`,
        link,
        item: data.map((item) => ({
            title: item.question.title,
            description: item.excerpt,
            pubDate: parseDate(item.created_time * 1000),
            link: `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`,
        })),
    };
}
