const querystring = require('querystring');
const got = require('@/utils/got');
const weiboUtils = require('./utils');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { fallback, queryToBoolean } = require('@/utils/readable-social');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    let displayVideo = '1';
    if (ctx.params.routeParams) {
        if (ctx.params.routeParams === '1' || ctx.params.routeParams === '0') {
            displayVideo = ctx.params.routeParams;
        } else {
            const routeParams = querystring.parse(ctx.params.routeParams);
            displayVideo = fallback(undefined, queryToBoolean(routeParams.displayVideo), true) ? '1' : '0';
        }
    }

    const { data: containerData } = await got({
        method: 'get',
        url: `https://m.weibo.cn/profile/info?uid=${uid}`,
        headers: {
            Referer: 'https://m.weibo.cn/',
        },
    });
    const name = containerData.data.user.screen_name;
    const description = containerData.data.user.description;
    const profileImageUrl = containerData.data.user.profile_image_url;
    const containerid = containerData.data.more.match(/\d+/)[0];

    const response = await got({
        method: 'get',
        url: `https://m.weibo.cn/api/container/getIndex?containerid=${containerid}`,
        headers: {
            Referer: `https://m.weibo.cn/u/${uid}`,
            'MWeibo-Pwa': 1,
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    const resultItem = await Promise.all(
        response.data.data.cards
            .filter((item) => item.mblog)
            .map(async (item) => {
                const key = 'weibo:user:' + item.mblog.bid;
                const data = await ctx.cache.tryGet(key, () => weiboUtils.getShowData(uid, item.mblog.bid));

                if (data && data.text) {
                    item.mblog.text = data.text;
                    item.mblog.created_at = parseDate(data.created_at);
                    if (item.mblog.retweeted_status && data.retweeted_status) {
                        item.mblog.retweeted_status.created_at = data.retweeted_status.created_at;
                    }
                } else {
                    item.mblog.created_at = timezone(item.mblog.created_at, +8);
                }
                // 转发的长微博处理
                const retweet = item.mblog.retweeted_status;
                if (retweet && retweet.isLongText) {
                    const retweetData = await weiboUtils.getShowData(retweet.user.id, retweet.bid);
                    if (retweetData !== undefined && retweetData.text) {
                        item.mblog.retweeted_status.text = retweetData.text;
                    }
                }

                const link = `https://weibo.com/${uid}/${item.mblog.bid}`;
                const formatExtended = weiboUtils.formatExtended(ctx, item.mblog);
                let description = formatExtended.description;
                const formattedTitle = formatExtended.title;
                const title = formattedTitle;
                const pubDate = item.mblog.created_at;

                // 视频的处理
                if (displayVideo === '1') {
                    description = weiboUtils.formatVideo(description, item.mblog);
                }

                return {
                    title,
                    description,
                    link,
                    pubDate,
                    author: item.mblog.user.screen_name,
                };
            })
    );

    ctx.state.data = {
        title: `${name}的微博`,
        link: `http://weibo.com/${uid}/`,
        description,
        image: profileImageUrl,
        item: resultItem,
    };
};
