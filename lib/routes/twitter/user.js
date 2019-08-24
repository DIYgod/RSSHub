const utils = require('./utils');
const config = require('@/config');

module.exports = async (ctx) => {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        throw 'Twitter RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }

    const id = ctx.params.id;
    const result = await utils.getTwit().get('statuses/user_timeline', {
        screen_name: id,
        tweet_mode: 'extended',
    });
    const data = result.data;
    const userInfo = data[0].user;
    const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;

    ctx.state.data = {
        title: `${userInfo.name} 的 Twitter`,
        link: `https://twitter.com/${id}/`,
        image: profileImageUrl,
        description: userInfo.description,
        item: utils.ProcessFeed({
            data,
        }),
    };
};
