import { Route } from '@/types';
import { config } from '@/config';

import parseArticle from './parse-article.js';
import { getWebInlineTopicFeedQuery } from './graphql.js';
import ConfigNotFoundError from '@/errors/types/config-not-found.js';

export const route: Route = {
    path: '/tag/:user/:tag',
    categories: ['blog'],
    example: '/medium/tag/imsingee/cybersecurity',
    parameters: { user: 'Username', tag: 'Subscribed Tag' },
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
    name: 'Personalized Recommendations - Tag',
    maintainers: ['ImSingee'],
    handler,
    description: `There are many tags, which can be obtained by clicking on a tag from the homepage and looking at the URL. For example, if the URL is \`https://medium.com/?tag=web3\`, then the tag is \`web3\`.

::: warning
  Personalized recommendations require the cookie value after logging in, so only self-hosting is supported. See the configuration module on the deployment page for details.
:::`,
};

async function handler(ctx) {
    const user = ctx.req.param('user');
    const tag = ctx.req.param('tag');

    const cookie = config.medium.cookies[user];
    if (cookie === undefined) {
        throw new ConfigNotFoundError(`缺少 Medium 用户 ${user} 登录后的 Cookie 值`);
    }

    const posts = await getWebInlineTopicFeedQuery(user, tag, cookie);
    ctx.set('json', posts);

    if (!posts) {
        // login failed
        throw new ConfigNotFoundError(`Medium 用户 ${user} 的 Cookie 无效或已过期`);
    }

    const urls = posts.items.map((data) => data.post.mediumUrl);

    const parsedArticles = await Promise.all(urls.map((url) => parseArticle(ctx, url)));

    return {
        title: `${user} Medium Following Tag ${tag}`,
        link: `https://medium.com/?tag=${tag}`,
        item: parsedArticles,
    };
}
