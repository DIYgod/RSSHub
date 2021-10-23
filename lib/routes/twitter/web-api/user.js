const utils = require('../utils');
const { getUser, getUserTweets, getUserTweetsAndReplies, excludeRetweet } = require('./twitter-api');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    // For compatibility
    const { exclude_replies, include_rts } = utils.parseRouteParams(ctx.params.routeParams);

    let data;
    const userInfo = await getUser(ctx.cache, id);
    if (exclude_replies) {
        data = await getUserTweets(ctx.cache, id);
    } else {
        data = await getUserTweetsAndReplies(ctx.cache, id);
    }
    if (!include_rts) {
        data = excludeRetweet(data);
    }

    const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;

    ctx.state.data = {
        title: `Twitter @${userInfo.name}`,
        link: `https://twitter.com/${id}`,
        image: profileImageUrl,
        description: userInfo.description,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
};
