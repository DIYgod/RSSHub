import pMap from 'p-map';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found.js';
import type { Route } from '@/types';

import { withMediumBrowser } from './browser';
import { getWebInlineTopicFeedQuery } from './graphql.js';
import parseArticle from './parse-article.js';

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
        requirePuppeteer: true,
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
:::

When Medium blocks article pages, their publicly visible previews may be returned.`,
};

function handler(ctx) {
    const user = ctx.req.param('user');
    const tag = ctx.req.param('tag');

    const cookie = config.medium.cookies[user];
    if (!cookie?.trim()) {
        throw new ConfigNotFoundError(`缺少 Medium 用户 ${user} 登录后的 Cookie 值`);
    }

    return withMediumBrowser(cookie, async (getBrowser) => {
        const posts = await getWebInlineTopicFeedQuery(user, tag, cookie, undefined, getBrowser);
        ctx.set('json', posts);

        if (!posts) {
            // login failed
            throw new ConfigNotFoundError(`Medium 用户 ${user} 的 Cookie 无效或已过期`);
        }

        const parsedArticles = await pMap(posts.items, ({ post }) => parseArticle(ctx, post.mediumUrl, { cookie, post }), { concurrency: 3 });

        return {
            title: `${user} Medium Following Tag ${tag}`,
            link: `https://medium.com/?tag=${tag}`,
            item: parsedArticles,
        };
    });
}
