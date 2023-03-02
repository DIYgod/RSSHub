const utils = require('../utils');
const { getUser, getUserTweets, getUserTweetsAndReplies, excludeRetweet } = require('./twitter-api');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    // For compatibility
    const { count, exclude_replies, include_rts } = utils.parseRouteParams(ctx.params.routeParams);
    const params = count ? { count } : {};

    let data;
    const userInfo = await getUser(ctx.cache, id);
    if (exclude_replies) {
        data = await getUserTweets(ctx.cache, id, params);
    } else {
        data = await getUserTweetsAndReplies(ctx.cache, id, params);
    }
    if (!include_rts) {
        data = excludeRetweet(data);
    }

    const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;

    ctx.state.data = {
        title: `Twitter @${userInfo.name}`,
        link: `https://twitter.com/${id}`,
        image: profileImageUrl.replace(/_normal.jpg$/, '.jpg'),
        description: userInfo.description,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
};
