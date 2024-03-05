// @ts-nocheck
import { config } from '@/config';

const parseArticle = require('./parse-article.js');
const { getWebInlineRecommendedFeedQuery } = require('./graphql.js');

export default async (ctx) => {
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

    ctx.set('data', {
        title: `${user} Medium For You`,
        link: 'https://medium.com/',
        item: parsedArticles,
    });
};
