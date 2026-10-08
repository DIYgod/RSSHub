import querystring from 'node:querystring';

import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';
import { fallback, queryToBoolean } from '@/utils/readable-social';
import { createWeiboOAuthState } from '@/utils/weibo-oauth';

import weiboUtils from './utils';

const getRedirectUrl = (ctx: Context) => {
    const redirectUrl = config.weibo.redirect_url || `${new URL(ctx.req.url).origin}/weibo/timeline/0`;
    const url = new URL(redirectUrl);
    if (config.accessKey && (url.searchParams.has('key') || url.searchParams.has('code'))) {
        throw new ConfigNotFoundError('WEIBO_REDIRECT_URL must not contain RSSHub key or code parameters when ACCESS_KEY is enabled.');
    }
    return redirectUrl;
};

const redirectToAuthorize = async (ctx: Context, feature: string | number, routeParams?: string) => {
    const url = new URL('https://api.weibo.com/oauth2/authorize');
    url.searchParams.set('client_id', config.weibo.app_key || '');
    url.searchParams.set('redirect_uri', getRedirectUrl(ctx));
    url.searchParams.set('state', config.accessKey ? await createWeiboOAuthState(ctx, feature, routeParams) : [feature, routeParams].filter((value) => value !== undefined).join('/'));
    ctx.header('Cache-Control', 'no-cache');
    return ctx.redirect(url.href);
};

export const route: Route = {
    path: '/timeline/:uid/:feature?/:routeParams?',
    categories: ['social-media'],
    example: '/weibo/timeline/3306934123',
    parameters: { uid: '用户的uid', feature: '过滤类型ID，0：全部、1：原创、2：图片、3：视频、4：音乐，默认为0。', routeParams: '额外参数；请参阅上面的说明和表格' },
    features: {
        requireConfig: [
            {
                name: 'WEIBO_APP_KEY',
                description: '',
            },
            {
                name: 'WEIBO_REDIRECT_URL',
                optional: true,
                description: "OAuth callback URL. Defaults to `<request origin>/weibo/timeline/0`. Set it when the auto-composed URL doesn't work",
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '个人时间线',
    maintainers: ['zytomorrow', 'DIYgod', 'Rongronggg9'],
    handler,
    description: `::: warning
需要对应用户打开页面进行授权生成 token 才能生成内容

自部署需要申请并配置微博 key，具体见部署文档。开启 ACCESS\\_KEY 时，先使用有效 key/code 打开订阅地址发起授权；回调使用十分钟内有效的一次性 state，要求可用的 memory 或 Redis 缓存。
:::`,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const feature = ctx.req.param('feature') || 0;
    const routeParams = ctx.req.param('routeParams') || undefined;
    const token = await cache.get('weibotimelineuid' + uid, false);
    let displayVideo = '1';
    let displayArticle = '0';
    let displayComments = '0';
    let showBloggerIcons = '0';
    if (routeParams) {
        if (routeParams === '1' || routeParams === '0') {
            displayVideo = routeParams;
        } else {
            const routeParams = querystring.parse(ctx.req.param('routeParams'));
            displayVideo = fallback(undefined, queryToBoolean(routeParams.displayVideo), true) ? '1' : '0';
            displayArticle = fallback(undefined, queryToBoolean(routeParams.displayArticle), false) ? '1' : '0';
            displayComments = fallback(undefined, queryToBoolean(routeParams.displayComments), false) ? '1' : '0';
            showBloggerIcons = fallback(undefined, queryToBoolean(routeParams.showBloggerIcons), false) ? '1' : '0';
        }
    }

    if (token) {
        const userInfo = await cache.tryGet(
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

        const response = await cache.tryGet(
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
            return redirectToAuthorize(ctx, feature, routeParams);
        }
        const resultItem = await Promise.all(
            response.statuses.map(async (item) => {
                const key = `weibotimelineurl${item.user.id}${item.id}`;
                const data = await cache.tryGet(key, () => weiboUtils.getShowData(uid, item.id));

                // 是否通过api拿到了data
                const isDataOK = data?.text;
                if (isDataOK) {
                    item = data;
                }

                // 转发的长微博处理
                const retweet = item.retweeted_status;
                if (retweet?.isLongText) {
                    const retweetData = await cache.tryGet(`weibo:retweeted:${retweet.user.id}:${retweet.id}`, () => weiboUtils.getShowData(retweet.user.id, retweet.id));
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
                    description = item.retweeted_status ? weiboUtils.formatVideo(description, item.retweeted_status) : weiboUtils.formatVideo(description, item);
                }

                // 评论的处理
                if (displayComments === '1') {
                    description = await weiboUtils.formatComments(ctx, description, item, showBloggerIcons);
                }

                // 文章的处理
                if (displayArticle === '1') {
                    // 含被转发微博时需要从被转发微博中获取文章
                    description = await (item.retweeted_status ? weiboUtils.formatArticle(ctx, description, item.retweeted_status) : weiboUtils.formatArticle(ctx, description, item));
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

        return weiboUtils.sinaimgTvax({
            title: `个人微博时间线--${name}`,
            link: `http://weibo.com/${uid}/`,
            description,
            image: profileImageUrl,
            item: resultItem,
        });
    }
    if (uid === '0' || (!config.accessKey && ctx.req.query('code'))) {
        const { app_key = '', app_secret = '' } = config.weibo;

        const code = ctx.req.query('code');
        const oauthState = ctx.get('weiboOAuthState');
        const routeParams = config.accessKey ? [oauthState?.feature, oauthState?.routeParams].filter((value) => value !== undefined).join('/') : ctx.req.query('state');
        if (code && (!config.accessKey || oauthState)) {
            const rep = await got.post('https://api.weibo.com/oauth2/access_token', {
                form: { client_id: app_key, client_secret: app_secret, code, redirect_uri: getRedirectUrl(ctx), grant_type: 'authorization_code' },
            });
            const token = rep.data.access_token;
            const uid = rep.data.uid;
            const expires_in = rep.data.expires_in;
            if (!token || !uid || !Number.isFinite(expires_in) || expires_in <= 0) {
                throw new Error('Weibo OAuth did not return a valid access token. Start authorization again.');
            }
            await cache.set('weibotimelineuid' + uid, token, expires_in);

            ctx.header('Cache-Control', 'no-cache');
            if (config.accessKey) {
                const path = `/weibo/timeline/${encodeURIComponent(uid)}/${encodeURIComponent(oauthState.feature)}${oauthState.routeParams ? `/${encodeURIComponent(oauthState.routeParams)}` : ''}`;
                return ctx.redirect(`${path}?code=${md5(path + config.accessKey)}`);
            }
            return ctx.redirect(`/weibo/timeline/${uid}${routeParams ? `/${routeParams}` : ''}`);
        }
    }
    return redirectToAuthorize(ctx, feature, routeParams);
}
