// @ts-nocheck
const utils = require('../utils');
const { getUser, getUserTweets, getUserTweetsAndReplies, excludeRetweet } = require('./twitter-api');
const { initToken } = require('./token');

export default async (ctx) => {
    const id = ctx.req.param('id');

    // For compatibility
    const { count, exclude_replies, include_rts } = utils.parseRouteParams(ctx.req.param('routeParams'));
    const params = count ? { count } : {};

    await initToken();
    const userInfo = await getUser(id);
    let data = await (exclude_replies ? getUserTweets(id, params) : getUserTweetsAndReplies(id, params));
    if (!include_rts) {
        data = excludeRetweet(data);
    }

    const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;

    ctx.set('data', {
        title: `Twitter @${userInfo.name}`,
        link: `https://twitter.com/${userInfo.screen_name}`,
        image: profileImageUrl.replace(/_normal.jpg$/, '.jpg'),
        description: userInfo.description,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    });
};
