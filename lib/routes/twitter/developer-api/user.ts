// @ts-nocheck
const utils = require('../utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
    // For compatibility
    const { exclude_replies, include_rts, count } = utils.parseRouteParams(ctx.req.param('routeParams'));
    const client = await utils.getAppClient();
    const user_timeline_query = {
        tweet_mode: 'extended',
        exclude_replies,
        include_rts,
        count,
    };
    let screen_name;
    if (id.startsWith('+')) {
        user_timeline_query.user_id = +id.slice(1);
    } else {
        user_timeline_query.screen_name = id;
        screen_name = id;
    }
    const data = await client.v1.get('statuses/user_timeline.json', user_timeline_query);
    const userInfo = data[0].user;
    if (!screen_name) {
        screen_name = userInfo.screen_name;
    }
    const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;

    ctx.set('data', {
        title: `Twitter @${userInfo.name}`,
        link: `https://twitter.com/${screen_name}`,
        image: profileImageUrl,
        description: userInfo.description,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    });
};
