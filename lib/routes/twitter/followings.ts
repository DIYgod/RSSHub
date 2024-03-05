// @ts-nocheck
const utils = require('./utils');
import { config } from '@/config';
const T = {};
const { TwitterApi } = require('twitter-api-v2');
import { fallback, queryToBoolean } from '@/utils/readable-social';

export default async (ctx) => {
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

    ctx.set('data', {
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
    });
};
