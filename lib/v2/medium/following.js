const config = require('@/config').value;

const parseArticle = require('./parse-article.js');
const { getFollowingFeedQuery } = require('./graphql.js');

module.exports = async (ctx) => {
    const user = ctx.params.user;

    const cookie = config.medium.cookies[user];
    if (cookie === undefined) {
        throw Error(`缺少 Medium 用户 ${user} 登录后的 Cookie 值`);
    }

    const posts = await getFollowingFeedQuery(user, cookie);
    ctx.state.json = posts;

    if (!posts) {
        // login failed
        throw Error(`Medium 用户 ${user} 的 Cookie 无效或已过期`);
    }

    const urls = posts.items.map((data) => data.post.mediumUrl);

    const parsedArticles = await Promise.all(urls.map((url) => parseArticle(ctx, url)));

    ctx.state.data = {
        title: `${user} Medium Following`,
        link: 'https://medium.com/?feed=following',
        item: parsedArticles,
    };
};
