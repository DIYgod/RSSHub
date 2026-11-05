import pMap from 'p-map';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getArticleDescription, getPageData, type LuoguArticle } from './utils';

export const route: Route = {
    path: '/user/blog/:name',
    categories: ['programming'],
    example: '/luogu/user/blog/ftiasch',
    parameters: { name: '博客名称' },
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
            source: ['luogu.com/blog/:name'],
        },
        {
            source: ['luogu.com.cn/blog/:name'],
        },
    ],
    name: '用户博客',
    maintainers: ['ftiasch'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');

    const blogBaseUrl = `https://www.luogu.com.cn/blog/${name}/`;

    const response = await ofetch(blogBaseUrl, { responseType: 'text' });
    const { articles, user } = getPageData<{ articles: { result: LuoguArticle[] }; user: { name: string } }>(response);
    const item = await pMap(
        articles.result,
        async (article) => {
            const link = `https://www.luogu.com/article/${article.lid}`;
            return {
                title: article.title,
                link,
                author: article.author.name,
                pubDate: parseDate(article.time, 'X'),
                description: await getArticleDescription(link),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `${user.name} - 洛谷博客`,
        link: blogBaseUrl,
        item,
    };
}
