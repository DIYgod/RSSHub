const utils = require('../utils');
// const config = require('@/config').value;
const { getUser, getUserMedia } = require('./twitter-api');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const { count } = utils.parseRouteParams(ctx.params.routeParams);
    const params = count ? { count } : {};

    const userInfo = await getUser(ctx.cache, id);
    const data = await getUserMedia(ctx.cache, id, params);
    const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;

    ctx.state.data = {
        title: `Twitter @${userInfo.name}`,
        link: `https://twitter.com/${id}/media`,
        image: profileImageUrl.replace(/_normal.jpg$/, '.jpg'),
        description: userInfo.description,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
};
