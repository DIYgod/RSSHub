import { Route } from '@/types';
import { config } from '@/config';

import parseArticle from './parse-article.js';
import { getWebInlineRecommendedFeedQuery } from './graphql.js';

export const route: Route = {
    path: '/for-you/:user',
    categories: ['blog'],
    example: '/medium/for-you/imsingee',
    parameters: { user: 'Username' },
    features: {
        requireConfig: [
            {
                name: 'MEDIUM_COOKIE_*',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Personalized Recommendations - For You',
    maintainers: ['ImSingee'],
    handler,
    description: `:::warning
  Personalized recommendations require the cookie value after logging in, so only self-hosting is supported. See the configuration module on the deployment page for details.
  :::`,
};

async function handler(ctx) {
    const user = ctx.req.param('user');

    const cookie = config.medium.cookies[user];
    if (cookie === undefined) {
        throw new Error(`缺少 Medium 用户 ${user} 登录后的 Cookie 值`);
    }

    const posts = await getWebInlineRecommendedFeedQuery(user, cookie);
    ctx.set('json', posts);

    if (!posts) {
        // login failed
        throw new Error(`Medium 用户 ${user} 的 Cookie 无效或已过期`);
    }

    const urls = posts.items.map((data) => data.post.mediumUrl);

    const parsedArticles = await Promise.all(urls.map((url) => parseArticle(ctx, url)));

    return {
        title: `${user} Medium For You`,
        link: 'https://medium.com/',
        item: parsedArticles,
    };
}
