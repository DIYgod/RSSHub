import { Route } from '@/types';
import { config } from '@/config';

import parseArticle from './parse-article.js';
import { getWebInlineTopicFeedQuery } from './graphql.js';

export const route: Route = {
    path: '/tag/:user/:tag',
    categories: ['programming'],
    example: '/medium/tag/imsingee/cybersecurity',
    parameters: { user: 'Username', tag: 'Subscribed Tag' },
    features: {
        requireConfig: true,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Personalized Recommendations - Tag',
    maintainers: ['ImSingee'],
    handler,
};

async function handler(ctx) {
    const user = ctx.req.param('user');
    const tag = ctx.req.param('tag');

    const cookie = config.medium.cookies[user];
    if (cookie === undefined) {
        throw new Error(`缺少 Medium 用户 ${user} 登录后的 Cookie 值`);
    }

    const posts = await getWebInlineTopicFeedQuery(user, tag, cookie);
    ctx.set('json', posts);

    if (!posts) {
        // login failed
        throw new Error(`Medium 用户 ${user} 的 Cookie 无效或已过期`);
    }

    const urls = posts.items.map((data) => data.post.mediumUrl);

    const parsedArticles = await Promise.all(urls.map((url) => parseArticle(ctx, url)));

    return {
        title: `${user} Medium Following Tag ${tag}`,
        link: `https://medium.com/?tag=${tag}`,
        item: parsedArticles,
    };
}
