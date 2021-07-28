const querystring = require('querystring');
const got = require('@/utils/got');
const weiboUtils = require('./utils');
const timezone = require('@/utils/timezone');
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

    const containerResponse = await got({
        method: 'get',
        url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}`,
        headers: {
            Referer: 'https://m.weibo.cn/',
        },
    });
    const name = containerResponse.data.data.userInfo.screen_name;
    const description = containerResponse.data.data.userInfo.description;
    const profileImageUrl = containerResponse.data.data.userInfo.profile_image_url;
    const containerid = containerResponse.data.data.tabsInfo.tabs[1].containerid;

    const response = await got({
        method: 'get',
        url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}&containerid=${containerid}`,
        headers: {
            Referer: `https://m.weibo.cn/u/${uid}`,
            'MWeibo-Pwa': 1,
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        },
    });

    const resultItem = await Promise.all(
        response.data.data.cards
            .filter((item) => item.mblog)
            .map(async (item) => {
                let data = {};
                const key = 'weibo:user:' + item.mblog.bid;
                const value = await ctx.cache.get(key);
                if (value) {
                    data = JSON.parse(value);
                } else {
                    // 可以判断出是否是长微博，如果不是那么不调下边的接口获取完整全文也行，但是拿不到准确的created_at，而是“几小时前”这种
                    // 索性就都再调接口获取详细data了，这个接口只返回json所以性能消耗不大。另外做了缓存处理
                    data = await weiboUtils.getShowData(uid, item.mblog.bid);
                    ctx.cache.set(key, JSON.stringify(data));
                }

                // 是否通过api拿到了data
                const isDataOK = data !== undefined && data.text;
                if (isDataOK) {
                    item.mblog.text = data.text;
                    item.mblog.created_at = data.created_at;
                    if (item.mblog.retweeted_status && data.retweeted_status) {
                        item.mblog.retweeted_status.created_at = data.retweeted_status.created_at;
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
                const formattedTitle = formatExtended.title;
                const title = formattedTitle;
                const pubDate = isDataOK ? new Date(data.created_at) : timezone(item.mblog.created_at, +8);

                // 视频的处理
                if (displayVideo === '1') {
                    description = weiboUtils.formatVideo(description, item.mblog);
                }

                const it = {
                    title: title,
                    description: description,
                    link: link,
                    pubDate: pubDate,
                    author: item.mblog.user.screen_name,
                };
                return Promise.resolve(it);
            })
    );

    ctx.state.data = {
        title: `${name}的微博`,
        link: `http://weibo.com/${uid}/`,
        description: description,
        image: profileImageUrl,
        item: resultItem,
    };
};
