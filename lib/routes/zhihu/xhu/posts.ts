import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import auth from './auth';

export const route: Route = {
    path: '/xhu/people/posts/:hexId',
    categories: ['social-media'],
    example: '/zhihu/xhu/people/posts/246e6cf44e94cefbf4b959cb5042bc91',
    parameters: { hexId: '用户的 16 进制 id，获取方式同 [xhu - 用户动态](#zhi-hu-xhu-yong-hu-dong-tai)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'xhu - 用户文章',
    maintainers: ['JimenezLi'],
    handler,
};

async function handler(ctx) {
    const xhuCookie = await auth.getCookie();
    const hexId = ctx.req.param('hexId');
    const link = `https://www.zhihu.com/people/${hexId}/posts`;
    const url = `https://api.zhihuvvv.workers.dev/people/${hexId}/articles?limit=20&offset=0`;

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
        title: `${data[0].author.name} 的知乎文章`,
        link,
        image: data[0].author.avatar_url,
        description: data[0].author.headline,
        item: data.map((item) => ({
            title: item.title,
            description: item.excerpt,
            pubDate: parseDate(item.created * 1000),
            link: `https://zhuanlan.zhihu.com/p/${item.id}`,
            author: item.author.name,
        })),
    };
}
