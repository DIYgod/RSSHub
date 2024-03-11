import { Route } from '@/types';
import utils from './utils';
import { config } from '@/config';
const T = {};
import { TwitterApi } from 'twitter-api-v2';
import { fallback, queryToBoolean } from '@/utils/readable-social';

export const route: Route = {
    path: '/followings/:id/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/followings/DIYgod',
    parameters: { id: 'username', routeParams: 'extra parameters, see the table above' },
    features: {
        requireConfig: [
            {
                name: 'TWITTER_USERNAME',
                description: '',
            },
            {
                name: 'TWITTER_PASSWORD',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User following timeline',
    maintainers: ['DIYgod'],
    handler,
    description: `:::warning
  This route requires Twitter token's corresponding id, therefore it's only available when self-hosting, refer to the [Deploy Guide](/install/#route-specific-configurations) for route-specific configurations.
  :::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const cookie = config.twitter.tokens[id];
    if (!cookie) {
        throw new Error(`lacking twitter token for user ${id}`);
    } else if (!T[id]) {
        const token = cookie.split(',');
        T[id] = new TwitterApi({
            appKey: token[0],
            appSecret: token[1],
            accessToken: token[2],
            accessSecret: token[3],
        }).readOnly;
    }

    const data = await T[id].v1.get('statuses/home_timeline.json', {
        tweet_mode: 'extended',
        count: 100,
    });

    // undefined and strings like "exclude_rts_replies" is also safely parsed, so no if branch is needed
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));

    return {
        title: `${id} 的 Twitter 关注时间线`,
        link: `https://twitter.com/${id}/`,
        item: utils.ProcessFeed(
            ctx,
            {
                data,
            },
            {
                showAuthorInTitle: fallback(undefined, queryToBoolean(routeParams.get('showAuthorInTitle')), true),
                showAuthorInDesc: fallback(undefined, queryToBoolean(routeParams.get('showAuthorInDesc')), true),
            }
        ),
    };
}
