// const config = require('@/config').value;
const { getUser, getUserTweet } = require('./twitter-api');
const utils = require('../utils');
const { fallback, queryToBoolean } = require('@/utils/readable-social');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const status = ctx.params.status;
    const routeParams = new URLSearchParams(ctx.params.original);
    const original = fallback(undefined, queryToBoolean(routeParams.get('original')), false);
    const params = { focalTweetId: status };
    const userInfo = await getUser(ctx.cache, id);
    const data = await getUserTweet(ctx.cache, id, params);
    const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;
    const item = original && config.isPackage ? data : utils.ProcessFeed(ctx, { data });

    ctx.state.data = {
        title: `Twitter @${userInfo.name}`,
        link: `https://twitter.com/${id}/status/${status}`,
        image: profileImageUrl.replace(/_normal.jpg$/, '.jpg'),
        description: userInfo.description,
        item,
    };
};
