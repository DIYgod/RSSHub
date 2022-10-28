const utils = require('./utils');
const config = require('@/config').value;
const T = {};
const { TwitterApi } = require('twitter-api-v2');
const { fallback, queryToBoolean } = require('@/utils/readable-social');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const cookie = config.twitter.tokens[id];
    if (!cookie) {
        throw Error(`lacking twitter token for user ${id}`);
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
    const routeParams = new URLSearchParams(ctx.params.routeParams);

    ctx.state.data = {
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
};
