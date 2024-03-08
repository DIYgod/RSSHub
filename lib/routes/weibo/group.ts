import cache from '@/utils/cache';
import querystring from 'querystring';
import got from '@/utils/got';
import { config } from '@/config';
import weiboUtils from './utils';
import { fallback, queryToBoolean } from '@/utils/readable-social';

export default async (ctx) => {
    if (!config.weibo.cookies) {
        throw new Error('Weibo Group Timeline is not available due to the absense of [Weibo Cookies]. Check <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config tutorial</a>');
    }

    const gid = ctx.req.param('gid');
    const groupName = ctx.req.param('gname') || '微博分组';
    let displayVideo = '1';
    let displayArticle = '0';
    let displayComments = '0';
    if (ctx.req.param('routeParams')) {
        if (ctx.req.param('routeParams') === '1' || ctx.req.param('routeParams') === '0') {
            displayVideo = ctx.req.param('routeParams');
        } else {
            const routeParams = querystring.parse(ctx.req.param('routeParams'));
            displayVideo = fallback(undefined, queryToBoolean(routeParams.displayVideo), true) ? '1' : '0';
            displayArticle = fallback(undefined, queryToBoolean(routeParams.displayArticle), false) ? '1' : '0';
            displayComments = fallback(undefined, queryToBoolean(routeParams.displayComments), false) ? '1' : '0';
        }
    }

    const responseData = await cache.tryGet(
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
                const retweetData = await cache.tryGet(`weibo:retweeted:${retweet.user.id}:${retweet.bid}`, () => weiboUtils.getShowData(retweet.user.id, retweet.bid));
                if (retweetData !== undefined && retweetData.text) {
                    item.retweeted_status.text = retweetData.text;
                }
            }

            const formatExtended = weiboUtils.formatExtended(ctx, item);
            let description = formatExtended.description;

            if (displayVideo === '1') {
                description = item.retweeted_status ? weiboUtils.formatVideo(description, item.retweeted_status) : weiboUtils.formatVideo(description, item);
            }

            if (displayComments === '1') {
                description = await weiboUtils.formatComments(ctx, description, item);
            }

            if (displayArticle === '1') {
                description = await (item.retweeted_status ? weiboUtils.formatArticle(ctx, description, item.retweeted_status) : weiboUtils.formatArticle(ctx, description, item));
            }

            return {
                ...formatExtended,
                description,
            };
        })
    );

    ctx.set(
        'data',
        weiboUtils.sinaimgTvax({
            title: groupName,
            link: `https://weibo.com/mygroups?gid=${gid}`,
            description: '微博自定义分组',
            item: resultItems,
        })
    );
};
