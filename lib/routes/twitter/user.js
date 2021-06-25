const utils = require('./utils');
const config = require('@/config').value;
const { getUser, getUserTweets, getUserTweetsAndReplies, excludeRetweet } = require('./twitter-api');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    let userInfo, data;

    // For compatibility
    const { exclude_replies, include_rts, count } = utils.parseRouteParams(ctx.params.routeParams);

    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        userInfo = await getUser(id);
        if (exclude_replies) {
            data = await getUserTweets(id);
        } else {
            data = await getUserTweetsAndReplies(id);
        }
        if (!include_rts) {
            data = excludeRetweet(data);
        }
    } else {
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
