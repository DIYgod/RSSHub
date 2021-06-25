const utils = require('./utils');
// const config = require('@/config').value;
const { getUser, getUserMedia } = require('./twitter-api');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const userInfo = await getUser(id);
    const data = await getUserMedia(id);
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
