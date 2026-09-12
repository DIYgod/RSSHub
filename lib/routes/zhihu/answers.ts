import type { Route } from '@/types';
import { isWorker } from '@/utils/is-worker';
import { parseDate } from '@/utils/parse-date';

import { processImage, withZhihuClient } from './utils';

export const route: Route = {
    path: '/people/answers/:id',
    categories: ['social-media'],
    example: '/zhihu/people/answers/diygod',
    parameters: { id: '作者 id，可在用户主页 URL 中找到' },
    features: {
        requireConfig: [
            {
                name: 'ZHIHU_COOKIES',
                description: 'A complete d_c0 and __zse_ck cookie pair skips session initialization. Otherwise Workers use a Playwright browser session; Docker and Vercel generate credentials with JSDOM.',
                optional: true,
            },
        ],
        requirePuppeteer: isWorker || process.env.WORKER_BUILD === 'true',
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.zhihu.com/people/:id/answers'],
        },
    ],
    name: '用户回答',
    maintainers: ['DIYgod', 'prnake'],
    handler,
};

function handler(ctx) {
    const id = ctx.req.param('id');

    // second: get real data from zhihu
    const apiPath = `/api/v4/members/${id}/answers?limit=7&include=data[*].is_normal,content`;

    return withZhihuClient(`https://www.zhihu.com/people/${id}`, async (client) => {
        const response = await client.get(apiPath);
        const data = response.data;
        const items = data.map((item) => {
            const title = item.question.title;
            const url = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
            const author = item.author.name;
            const description = processImage(item.content);

            return {
                title,
                author,
                description,
                pubDate: parseDate(item.created_time * 1000),
                link: url,
            };
        });

        return {
            title: `${data[0].author.name}的知乎回答`,
            link: `https://www.zhihu.com/people/${id}/answers`,
            item: items,
        };
    });
}
