import pMap from 'p-map';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getArticleDescription, getPageData, type LuoguArticle } from './utils';

export const route: Route = {
    path: '/user/article/:uid',
    categories: ['programming'],
    example: '/luogu/user/article/1',
    parameters: { uid: '用户 UID' },
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
            source: ['luogu.com/user/:uid'],
        },
        {
            source: ['luogu.com.cn/user/:uid'],
        },
    ],
    name: '用户文章',
    maintainers: ['TonyRL'],
    handler,
};

const baseUrl = 'https://www.luogu.com';

async function handler(ctx) {
    const { uid } = ctx.req.param();

    const link = `${baseUrl}/user/${uid}/article`;
    const response = await ofetch(link, { responseType: 'text' });
    const { articles, user } = getPageData<{ articles: { result: LuoguArticle[] }; user: { name: string; slogan: string; avatar: string } }>(response);
    const item = await pMap(
        articles.result,
        async (article) => {
            const link = `${baseUrl}/article/${article.lid}`;
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
        title: `${user.name} 的个人中心 - 洛谷 | 计算机科学教育新生态`,
        description: user.slogan,
        link,
        image: user.avatar,
        item,
    };
}
