const querystring = require('querystring');
const got = require('@/utils/got');
const weiboUtils = require('./utils');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { fallback, queryToBoolean } = require('@/utils/readable-social');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    let displayVideo = '1';
    let displayArticle = '0';
    if (ctx.params.routeParams) {
        if (ctx.params.routeParams === '1' || ctx.params.routeParams === '0') {
            displayVideo = ctx.params.routeParams;
        } else {
            const routeParams = querystring.parse(ctx.params.routeParams);
            displayVideo = fallback(undefined, queryToBoolean(routeParams.displayVideo), true) ? '1' : '0';
            displayArticle = fallback(undefined, queryToBoolean(routeParams.displayArticle), false) ? '1' : '0';
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

    let earliestDate;

    const resultItem = await Promise.all(
        response.data.data.cards
            .reverse() // reverse first to ensure the pinned card will be processed lastly
            .map(async (item) => {
                if (!item.mblog && item.card_group && Array.isArray(item.card_group) && item.card_group.length > 0) {
                    // w/o `mblog`, it may have a `card_group` containing only 1 card
                    // only get the 1st card because we haven't observed that there can be multiple cards in it
                    item = item.card_group[0];
                }

                if (!item.mblog) {
                    return; // drop
                }

                const key = 'weibo:user:' + item.mblog.bid;
                const data = await ctx.cache.tryGet(key, () => weiboUtils.getShowData(uid, item.mblog.bid));

                if (data && data.text) {
                    item.mblog.text = data.text;
                    item.mblog.created_at = parseDate(data.created_at);
                    item.mblog.pics = data.pics;
                    if (item.mblog.retweeted_status && data.retweeted_status) {
                        item.mblog.retweeted_status.created_at = data.retweeted_status.created_at;
                    }
                } else {
                    item.mblog.created_at = timezone(item.mblog.created_at, +8);
                }

                // drop too old pinned weibo, otherwise preserve it
                if (!item.mblog.title || item.mblog.title.text !== '置顶') {
                    if (!earliestDate || (item.mblog.created_at && earliestDate > item.mblog.created_at)) {
                        earliestDate = item.mblog.created_at;
                    }
                } else {
                    if (earliestDate && item.mblog.created_at && earliestDate > item.mblog.created_at) {
                        return;
                    }
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
                const title = formatExtended.title;
                const pubDate = item.mblog.created_at;

                // 视频的处理
                if (displayVideo === '1') {
                    // 含被转发微博时需要从被转发微博中获取视频
                    if (item.mblog.retweeted_status) {
                        description = weiboUtils.formatVideo(description, item.mblog.retweeted_status);
                    } else {
                        description = weiboUtils.formatVideo(description, item.mblog);
                    }
                }

                // 文章的处理
                if (displayArticle === '1') {
                    // 含被转发微博时需要从被转发微博中获取文章
                    if (item.mblog.retweeted_status) {
                        description = await weiboUtils.formatArticle(ctx, description, item.mblog.retweeted_status);
                    } else {
                        description = await weiboUtils.formatArticle(ctx, description, item.mblog);
                    }
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
        item: resultItem.filter((item) => item).reverse(),
    };
};
