const utils = require('../utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    // For compatibility
    const { exclude_replies, include_rts, count } = utils.parseRouteParams(ctx.params.routeParams);
    const client = await utils.getAppClient();
    const data = await client.v1.get('statuses/user_timeline.json', {
        screen_name: id,
        tweet_mode: 'extended',
        exclude_replies,
        include_rts,
        count,
    });
    const userInfo = data[0].user;

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
