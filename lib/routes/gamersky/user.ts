import type { Context } from 'hono';
import type { Route } from '@/types';
import { getUserArticle, getUserArticleList, parseUserArticleList } from './utils';

export const route: Route = {
    path: '/user/:userId/:detail?',
    categories: ['game'],
    example: '/gamersky/user/4009731/detail',
    parameters: {
        userId: '用户 ID。在用户个人主页，打开“开发者工具”中的“元素”标签页，搜索 data-userid 即可找到',
        detail: '是否获取文章详情。只要该参数不为空，就会获取全文内容',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户动态',
    maintainers: ['hualiong'],
    handler,
};

async function handler(ctx: Context) {
    const { userId, detail } = ctx.req.param();

    const body = await getUserArticleList(userId);
    const articles = parseUserArticleList(body);
    if (detail) {
        articles.list = await Promise.all(articles.list.map((item) => getUserArticle(item)));
    }
    return {
        title: `${articles.uname}的动态 - 游民星空`,
        link: articles.link,
        item: articles.list,
    };
}
