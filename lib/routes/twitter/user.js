const querystring = require('querystring');
const utils = require('./utils');
const config = require('@/config').value;
const { getUser, getUserTweets, getUserTweetsAndReplies, excludeRetweet } = require('./twitter-api');
const { fallback, queryToInteger, queryToBoolean } = require('@/utils/readable-social');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const routeParams = ctx.params.routeParams;
    let userInfo = await getUser(id);
    let data;

    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        if (routeParams === 'exclude_rts_replies' || routeParams === 'exclude_replies_rts' || routeParams === 'exclude_replies') {
            data = await getUserTweets(id);
        } else {
            data = await getUserTweetsAndReplies(id);
        }
        if (routeParams === 'exclude_rts_replies' || routeParams === 'exclude_replies_rts' || routeParams === 'exclude_rts') {
            data = excludeRetweet(data);
        }
    } else {
        let exclude_replies = false;
        let include_rts = true;

        // For compatibility
        let count = undefined;
        if (routeParams === 'exclude_rts_replies' || routeParams === 'exclude_replies_rts') {
            exclude_replies = true;
            include_rts = false;
        } else if (routeParams === 'exclude_replies') {
            exclude_replies = true;
            include_rts = true;
        } else if (routeParams === 'exclude_rts') {
            exclude_replies = false;
            include_rts = false;
        } else {
            const parsed = querystring.parse(routeParams);
            count = fallback(undefined, queryToInteger(parsed.count), undefined);
            exclude_replies = fallback(undefined, queryToBoolean(parsed.excludeReplies), false);
            include_rts = fallback(undefined, queryToBoolean(parsed.includeRts), true);
        }

        const result = await utils.getTwit().get('statuses/user_timeline', {
            screen_name: id,
            tweet_mode: 'extended',
            exclude_replies,
            include_rts,
            count: count,
        });
        data = result.data;
        userInfo = data[0].user;
    }
    const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;

    ctx.state.data = {
        title: `Twitter @${userInfo.name}`,
        link: `https://twitter.com/${id}/`,
        image: profileImageUrl,
        description: userInfo.description,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
};
