import { Route } from '@/types';
import { config } from '@/config';

import parseArticle from './parse-article.js';
import { getFollowingFeedQuery } from './graphql.js';

export const route: Route = {
    path: '/following/:user',
    categories: ['blog'],
    example: '/medium/following/imsingee',
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
    name: 'Personalized Recommendations - Following',
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

    const posts = await getFollowingFeedQuery(user, cookie);
    ctx.set('json', posts);

    if (!posts) {
        // login failed
        throw new Error(`Medium 用户 ${user} 的 Cookie 无效或已过期`);
    }

    const urls = posts.items.map((data) => data.post.mediumUrl);

    const parsedArticles = await Promise.all(urls.map((url) => parseArticle(ctx, url)));

    return {
        title: `${user} Medium Following`,
        link: 'https://medium.com/?feed=following',
        item: parsedArticles,
    };
}
