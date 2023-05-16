const querystring = require('querystring');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;
const weiboUtils = require('./utils');
const { fallback, queryToBoolean } = require('@/utils/readable-social');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const feature = ctx.params.feature || 0;
    const routeParams = ctx.params.routeParams || undefined;
    const token = await ctx.cache.get('weibotimelineuid' + uid, false);
    let displayVideo = '1';
    let displayArticle = '0';
    let displayComments = '0';
    if (routeParams) {
        if (routeParams === '1' || routeParams === '0') {
            displayVideo = routeParams;
        } else {
            const routeParams = querystring.parse(ctx.params.routeParams);
            displayVideo = fallback(undefined, queryToBoolean(routeParams.displayVideo), true) ? '1' : '0';
            displayArticle = fallback(undefined, queryToBoolean(routeParams.displayArticle), false) ? '1' : '0';
            displayComments = fallback(undefined, queryToBoolean(routeParams.displayComments), false) ? '1' : '0';
        }
    }

    if (token) {
        const userInfo = await ctx.cache.tryGet(
            `weibo:timeline:userInfo:${uid}`,
            async () => {
                const _r = await got({
                    method: 'get',
                    url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}`,
                    headers: {
                        Referer: 'https://m.weibo.cn/',
                    },
                });
                return _r.data.data.userInfo;
            },
            config.cache.routeExpire,
            false
        );
        const name = userInfo.screen_name;
        const description = userInfo.description;
        const profileImageUrl = userInfo.profile_image_url;

        const response = await ctx.cache.tryGet(
            `weibo:timeline:${uid}`,
            async () => {
                const _r = await got(`https://api.weibo.com/2/statuses/home_timeline.json?access_token=${token}&count=100&feature=${feature}`);
                return _r.data;
            },
            config.cache.routeExpire,
            false
        );
        // 检查token失效
        if (response.error !== undefined) {
            const { app_key = '', redirect_url = ctx.request.origin + '/weibo/timeline/0' } = config.weibo;

            ctx.status = 302;
            ctx.set({
                'Cache-Control': 'no-cache',
            });
            ctx.redirect(`https://api.weibo.com/oauth2/authorize?client_id=${app_key}&redirect_uri=${redirect_url}${routeParams ? `&state=${routeParams}` : ''}`);
        }
        const resultItem = await Promise.all(
            response.statuses.map(async (item) => {
                const key = `weibotimelineurl${item.user.id}${item.id}`;
                const data = await ctx.cache.tryGet(key, () => weiboUtils.getShowData(uid, item.id));

                // 是否通过api拿到了data
                const isDataOK = data?.text;
                if (isDataOK) {
                    item = data;
                }

                // 转发的长微博处理
                const retweet = item.retweeted_status;
                if (retweet?.isLongText) {
                    const retweetData = await ctx.cache.tryGet(`weibo:retweeted:${retweet.user.id}:${retweet.id}`, () => weiboUtils.getShowData(retweet.user.id, retweet.id));
                    if (retweetData?.text) {
                        item.retweeted_status.text = retweetData.text;
                    }
                }

                const guid = `https://weibo.com/${uid}/${item.id}`;
                // not using formatExtended.guid in order not to introduce breaking change

                const formatExtended = weiboUtils.formatExtended(ctx, item, uid);
                let description = formatExtended.description;
                const pubDate = isDataOK ? parseDate(data.created_at) : parseDate(item.created_at);

                // 视频的处理
                if (displayVideo === '1') {
                    // 含被转发微博时需要从被转发微博中获取视频
                    if (item.retweeted_status) {
                        description = weiboUtils.formatVideo(description, item.retweeted_status);
                    } else {
                        description = weiboUtils.formatVideo(description, item);
                    }
                }

                // 评论的处理
                if (displayComments === '1') {
                    description = await weiboUtils.formatComments(ctx, description, item);
                }

                // 文章的处理
                if (displayArticle === '1') {
                    // 含被转发微博时需要从被转发微博中获取文章
                    if (item.retweeted_status) {
                        description = await weiboUtils.formatArticle(ctx, description, item.retweeted_status);
                    } else {
                        description = await weiboUtils.formatArticle(ctx, description, item);
                    }
                }

                return {
                    ...formatExtended,
                    guid,
                    description,
                    pubDate,
                    author: item.user.screen_name,
                };
            })
        );

        ctx.state.data = weiboUtils.sinaimgTvax({
            title: `个人微博时间线--${name}`,
            link: `http://weibo.com/${uid}/`,
            description,
            image: profileImageUrl,
            item: resultItem,
        });
    } else if (uid === '0' || ctx.querystring) {
        const { app_key = '', redirect_url = ctx.request.origin + '/weibo/timeline/0', app_secret = '' } = config.weibo;

        const code = ctx.query.code;
        const routeParams = ctx.query.state;
        if (code) {
            const rep = await got.post(`https://api.weibo.com/oauth2/access_token?client_id=${app_key}&client_secret=${app_secret}&code=${code}&redirect_uri=${redirect_url}&grant_type=authorization_code`);
            const token = rep.data.access_token;
            const uid = rep.data.uid;
            const expires_in = rep.data.expires_in;
            await ctx.cache.set('weibotimelineuid' + uid, token, expires_in);

            ctx.set({
                'Content-Type': 'text/html; charset=UTF-8',
                'Cache-Control': 'no-cache',
            });
            ctx.body = `<script>window.location = '/weibo/timeline/${uid}${routeParams ? `/${routeParams}` : ''}'</script>`;
        }
    } else {
        const { app_key = '', redirect_url = ctx.request.origin + '/weibo/timeline/0' } = config.weibo;

        ctx.status = 302;
        ctx.set({
            'Cache-Control': 'no-cache',
        });
        ctx.redirect(`https://api.weibo.com/oauth2/authorize?client_id=${app_key}&redirect_uri=${redirect_url}${routeParams ? `&state=${feature}/${routeParams.replace(/&/g, '%26')}` : ''}`);
    }
};
