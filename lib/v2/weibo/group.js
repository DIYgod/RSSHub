const querystring = require('querystring');
const got = require('@/utils/got');
const config = require('@/config').value;
const weiboUtils = require('./utils');
const { fallback, queryToBoolean } = require('@/utils/readable-social');

module.exports = async (ctx) => {
    if (!config.weibo_cookies) {
        throw 'Weibo Group Timeline is not available due to the absense of [Weibo Cookies]. Check <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config tutorial</a>';
    }

    const gid = ctx.params.gid;
    const groupName = ctx.params.gname || '微博分组';
    let displayVideo = '1';
    let displayArticle = '0';
    let displayComments = '0';
    if (ctx.params.routeParams) {
        if (ctx.params.routeParams === '1' || ctx.params.routeParams === '0') {
            displayVideo = ctx.params.routeParams;
        } else {
            const routeParams = querystring.parse(ctx.params.routeParams);
            displayVideo = fallback(undefined, queryToBoolean(routeParams.displayVideo), true) ? '1' : '0';
            displayArticle = fallback(undefined, queryToBoolean(routeParams.displayArticle), false) ? '1' : '0';
            displayComments = fallback(undefined, queryToBoolean(routeParams.displayComments), false) ? '1' : '0';
        }
    }

    const responseData = await ctx.cache.tryGet(
        `weibo:group:index:${gid}`,
        async () => {
            const _r = await got({
                method: 'get',
                url: `https://m.weibo.cn/feed/group?gid=${gid}`,
                headers: {
                    Referer: `https://m.weibo.cn/`,
                    'MWeibo-Pwa': 1,
                    'X-Requested-With': 'XMLHttpRequest',
                    Cookie: config.weibo.cookies,
                },
            });
            return _r.data.data;
        },
        config.cache.routeExpire,
        false
    );

    const resultItems = await Promise.all(
        responseData.statuses.map(async (item) => {
            const retweet = item.retweeted_status;
            if (retweet && retweet.isLongText) {
                const retweetData = await ctx.cache.tryGet(`weibo:retweeted:${retweet.user.id}:${retweet.bid}`, () => weiboUtils.getShowData(retweet.user.id, retweet.bid));
                if (retweetData !== undefined && retweetData.text) {
                    item.retweeted_status.text = retweetData.text;
                }
            }

            const formatExtended = weiboUtils.formatExtended(ctx, item);
            let description = formatExtended.description;

            if (displayVideo === '1') {
                if (item.retweeted_status) {
                    description = weiboUtils.formatVideo(description, item.retweeted_status);
                } else {
                    description = weiboUtils.formatVideo(description, item);
                }
            }

            if (displayComments === '1') {
                description = await weiboUtils.formatComments(ctx, description, item);
            }

            if (displayArticle === '1') {
                if (item.retweeted_status) {
                    description = await weiboUtils.formatArticle(ctx, description, item.retweeted_status);
                } else {
                    description = await weiboUtils.formatArticle(ctx, description, item);
                }
            }

            return {
                ...formatExtended,
                description,
            };
        })
    );

    ctx.state.data = weiboUtils.sinaimgTvax({
        title: groupName,
        link: `https://weibo.com/mygroups?gid=${gid}`,
        description: '微博自定义分组',
        item: resultItems,
    });
};
