import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import querystring from 'querystring';
import got from '@/utils/got';
import weiboUtils from './utils';
import { config } from '@/config';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { fallback, queryToBoolean } from '@/utils/readable-social';

export const route: Route = {
    path: '/user/:uid/:routeParams?',
    categories: ['social-media', 'popular'],
    view: ViewType.SocialMedia,
    example: '/weibo/user/1195230310',
    parameters: { uid: '用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取', routeParams: '额外参数；请参阅上面的说明和表格；特别地，当 `routeParams=1` 时开启微博视频显示' },
    features: {
        requireConfig: [
            {
                name: 'WEIBO_COOKIES',
                optional: true,
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['m.weibo.cn/u/:uid', 'm.weibo.cn/profile/:uid'],
            target: '/user/:uid',
        },
        {
            source: ['weibo.com/u/:uid'],
            target: '/user/:uid',
        },
        {
            source: ['www.weibo.com/u/:uid'],
            target: '/user/:uid',
        },
    ],
    name: '博主',
    maintainers: ['DIYgod', 'iplusx', 'Rongronggg9', 'Konano'],
    handler,
    description: `:::warning
  部分博主仅登录可见，未提供 Cookie 的情况下不支持订阅，可以通过打开 \`https://m.weibo.cn/u/:uid\` 验证
  :::`,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    let displayVideo = '1';
    let displayArticle = '0';
    let displayComments = '0';
    let showRetweeted = '1';
    if (ctx.req.param('routeParams')) {
        if (ctx.req.param('routeParams') === '1' || ctx.req.param('routeParams') === '0') {
            displayVideo = ctx.req.param('routeParams');
        } else {
            const routeParams = querystring.parse(ctx.req.param('routeParams'));
            displayVideo = fallback(undefined, queryToBoolean(routeParams.displayVideo), true) ? '1' : '0';
            displayArticle = fallback(undefined, queryToBoolean(routeParams.displayArticle), false) ? '1' : '0';
            displayComments = fallback(undefined, queryToBoolean(routeParams.displayComments), false) ? '1' : '0';
            showRetweeted = fallback(undefined, queryToBoolean(routeParams.showRetweeted), false) ? '1' : '0';
        }
    }
    const containerData = await cache.tryGet(
        `weibo:user:index:${uid}`,
        async () => {
            const _r = await got({
                method: 'get',
                url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}`,
                headers: {
                    Referer: `https://m.weibo.cn/u/${uid}`,
                    'MWeibo-Pwa': 1,
                    'X-Requested-With': 'XMLHttpRequest',
                    Cookie: config.weibo.cookies,
                },
            });
            return _r.data;
        },
        config.cache.routeExpire,
        false
    );

    const name = containerData.data.userInfo.screen_name;
    const description = containerData.data.userInfo.description;
    const profileImageUrl = containerData.data.userInfo.profile_image_url;
    const containerId = containerData.data.tabsInfo.tabs.find((item) => item.tab_type === 'weibo').containerid;

    const cards = await cache.tryGet(
        `weibo:user:cards:${uid}:${containerId}`,
        async () => {
            const _r = await got({
                method: 'get',
                url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}&containerid=${containerId}`,
                headers: {
                    Referer: `https://m.weibo.cn/u/${uid}`,
                    'MWeibo-Pwa': 1,
                    'X-Requested-With': 'XMLHttpRequest',
                    Cookie: config.weibo.cookies,
                },
            });
            return _r.data.data.cards;
        },
        config.cache.routeExpire,
        false
    );

    let resultItems = await Promise.all(
        cards
            .filter((item) => {
                if (item.mblog === undefined) {
                    return false;
                }
                if (showRetweeted === '0' && item.mblog.retweeted_status) {
                    return false;
                }
                return true;
            })
            .map(async (item) => {
                // TODO: unify cache key and let weiboUtils.getShowData() handle the cache? It seems safe to do so.
                //       Need more investigation, pending for now since the current version works fine.
                // TODO: getShowData() on demand? The API seems to return most things we need since 2022/05/21.
                //       Need more investigation, pending for now since the current version works fine.
                const key = 'weibo:user:' + item.mblog.bid;
                const data = await cache.tryGet(key, () => weiboUtils.getShowData(uid, item.mblog.bid));

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

                // 转发的长微博处理
                const retweet = item.mblog.retweeted_status;
                if (retweet && retweet.isLongText) {
                    // TODO: unify cache key and ...
                    const retweetData = await cache.tryGet(`weibo:retweeted:${retweet.user.id}:${retweet.bid}`, () => weiboUtils.getShowData(retweet.user.id, retweet.bid));
                    if (retweetData !== undefined && retweetData.text) {
                        item.mblog.retweeted_status.text = retweetData.text;
                    }
                }

                const formatExtended = weiboUtils.formatExtended(ctx, item.mblog, uid);
                let description = formatExtended.description;

                // 视频的处理
                if (displayVideo === '1') {
                    // 含被转发微博时需要从被转发微博中获取视频
                    description = item.mblog.retweeted_status ? weiboUtils.formatVideo(description, item.mblog.retweeted_status) : weiboUtils.formatVideo(description, item.mblog);
                }

                // 评论的处理
                if (displayComments === '1') {
                    description = await weiboUtils.formatComments(ctx, description, item.mblog);
                }

                // 文章的处理
                if (displayArticle === '1') {
                    // 含被转发微博时需要从被转发微博中获取文章
                    description = await (item.mblog.retweeted_status ? weiboUtils.formatArticle(ctx, description, item.mblog.retweeted_status) : weiboUtils.formatArticle(ctx, description, item.mblog));
                }

                return {
                    ...formatExtended,
                    description,
                    isPinned: item.profile_type_id?.startsWith('proweibotop'),
                };
            })
    );

    // remove pinned weibo if they are posted before the earliest **ordinary** weibo
    // there may be multiple pinned weibo at the same time, only remove the ones that meet the above condition
    const pinnedItems = resultItems.filter((item) => item.isPinned);
    const ordinaryItems = resultItems.filter((item) => !item.isPinned);
    if (pinnedItems.length > 0 && ordinaryItems.length > 0) {
        const earliestOrdinaryPostTime = Math.min(...ordinaryItems.map((i) => i.pubDate).filter(Boolean));
        resultItems = ordinaryItems;
        for (const item of pinnedItems) {
            if (item.pubDate > earliestOrdinaryPostTime) {
                resultItems.unshift(item);
            }
        }
    }

    return weiboUtils.sinaimgTvax({
        title: `${name}的微博`,
        link: `https://weibo.com/${uid}/`,
        description,
        image: profileImageUrl,
        item: resultItems,
        allowEmpty: true,
    });
}
