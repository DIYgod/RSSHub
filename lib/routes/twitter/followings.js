const querystring = require('querystring');
const utils = require('./utils');
const config = require('@/config').value;
const T = {};
const Twit = require('twit');
const { fallback, queryToBoolean } = require('@/utils/readable-social');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const cookie = config.twitter.tokens[id];
    if (!cookie) {
        throw Error(`lacking twitter token for user ${id}`);
    } else if (!T[id]) {
        const token = cookie.split(',');
        T[id] = new Twit({
            consumer_key: token[0],
            consumer_secret: token[1],
            access_token: token[2],
            access_token_secret: token[3],
        });
    }

    const result = await T[id].get('statuses/home_timeline', {
        tweet_mode: 'extended',
        count: 100,
    });
    const data = result.data;

    // undefined and strings like "exclude_rts_replies" is also safely parsed, so no if branch is needed
    const routeParams = querystring.parse(ctx.params.routeParams);

    ctx.state.data = {
        title: `${id} 的 Twitter 关注时间线`,
        link: `https://twitter.com/${id}/`,
        item: utils.ProcessFeed(
            ctx,
            {
                data,
            },
            {
                showAuthorInTitle: fallback(undefined, queryToBoolean(routeParams.showAuthorInTitle), true),
                showAuthorInDesc: fallback(undefined, queryToBoolean(routeParams.showAuthorInDesc), true),
            }
        ),
    };
};
