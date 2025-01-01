import { Route } from '@/types';
import cache from '@/utils/cache';
import querystring from 'querystring';
import got from '@/utils/got';
import { config } from '@/config';
import weiboUtils from './utils';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { fallback, queryToBoolean } from '@/utils/readable-social';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/user_bookmarks/:uid/:routeParams?',
    categories: ['social-media'],
    example: '/weibo/user_bookmarks/1195230310',
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
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['weibo.com/'],
            target: '/user_bookmarks/:uid',
        },
    ],
    name: '用户收藏动态',
    maintainers: ['cztchoice'],
    handler,
    url: 'weibo.com/',
    description: `::: warning
  此方案必须使用用户\`Cookie\`进行抓取，只可以获取本人的收藏动态

  因微博 cookies 的过期与更新方案未经验证，部署一次 Cookie 的有效时长未知

  微博用户 Cookie 的配置可参照部署文档
:::`,
};

async function handler(ctx) {
    if (!config.weibo.cookies) {
        throw new ConfigNotFoundError('Weibo user bookmarks is not available due to the absense of [Weibo Cookies]. Check <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config tutorial</a>');
    }

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

    const uid = await cache.tryGet(
        'weibo:user_bookmarks:login-user',
        async () => {
            const _r = await got({
                method: 'get',
                url: 'https://m.weibo.cn/api/config',
                headers: {
                    Referer: 'https://m.weibo.cn/',
                    'MWeibo-Pwa': 1,
                    'X-Requested-With': 'XMLHttpRequest',
                    Cookie: config.weibo.cookies,
                },
            });
            return _r.data.data.uid;
        },
        config.cache.routeExpire,
        false
    );

    const containerData = await cache.tryGet(
        `weibo:user_bookmarks:index:${uid}`,
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
    const title = `${name} 的 最新收藏时间线`;
    const schemeString = containerData.data.scheme;
    const url = new URL(`http://example.com/${schemeString.replace('://', '?')}`);
    const params = new URLSearchParams(url.search);
    const bookmarkContainerId = params.get('lfid');

    const cards = await cache.tryGet(
        `weibo:user_bookmarks:cards:${uid}`,
        async () => {
            const _r = await got({
                method: 'get',
                url: `https://m.weibo.cn/api/container/getIndex?containerid=${bookmarkContainerId}&openApp=0`,
                headers: {
                    Referer: 'https://m.weibo.cn/',
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
    const resultItems = await Promise.all(
        cards
            .filter((item) => item.mblog)
            .map(async (item) => {
                const key = 'weibo:user_bookmarks:' + item.mblog.bid;
                const data = await cache.tryGet(key, () => weiboUtils.getShowData(uid, item.mblog.bid));

                if (data?.text) {
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
                if (retweet?.isLongText) {
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
                };
            })
    );

    return weiboUtils.sinaimgTvax({
        title,
        link: 'https://weibo.com',
        item: resultItems,
    });
}
