const querystring = require('querystring');
const utils = require('./utils');
const config = require('@/config').value;
const { fallback, queryToInteger, queryToBoolean } = require('@/utils/readable-social');

module.exports = async (ctx) => {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        throw 'Twitter RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }

    const id = ctx.params.id;
    const routeParams = ctx.params.routeParams;
    let exclude_replies = false;
    let include_rts = true;

    // For compatibility
    let count = undefined;
    if (routeParams === 'exclude_rts_replies' || routeParams === 'exclude_replies_rts') {
        exclude_replies = true;
        include_rts = false;
    } else if (routeParams === 'exclude_replies') {
        exclude_replies = true;
        include_rts = true;
    } else if (routeParams === 'exclude_rts') {
        exclude_replies = false;
        include_rts = false;
    } else {
        const parsed = querystring.parse(routeParams);
        count = fallback(undefined, queryToInteger(parsed.count), undefined);
        exclude_replies = fallback(undefined, queryToBoolean(parsed.excludeReplies), false);
        include_rts = fallback(undefined, queryToBoolean(parsed.includeRts), true);
    }

    const result = await utils.getTwit().get('statuses/user_timeline', {
        screen_name: id,
        tweet_mode: 'extended',
        exclude_replies,
        include_rts,
        count: count,
    });
    const data = result.data;
    const userInfo = data[0].user;
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
