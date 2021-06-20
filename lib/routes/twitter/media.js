const utils = require('./utils');
// const config = require('@/config').value;
const { getUser, getUserMedia } = require('./twitter-api');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    // if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
    const userInfo = await getUser(id);
    const data = await getUserMedia(id);
    // } else {
    // // else 里的代码应该是基于Twitter开发者API获取User Media的方式
    // // 留待申请到了Twitter Developer的好心人实现
    // }
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
