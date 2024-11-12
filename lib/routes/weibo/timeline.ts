import { Route } from '@/types';
import cache from '@/utils/cache';
import querystring from 'querystring';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import weiboUtils from './utils';
import { fallback, queryToBoolean } from '@/utils/readable-social';

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
                description: '',
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
    description: `:::warning
  需要对应用户打开页面进行授权生成 token 才能生成内容

  自部署需要申请并配置微博 key，具体见部署文档
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
    if (routeParams) {
        if (routeParams === '1' || routeParams === '0') {
            displayVideo = routeParams;
        } else {
            const routeParams = querystring.parse(ctx.req.param('routeParams'));
            displayVideo = fallback(undefined, queryToBoolean(routeParams.displayVideo), true) ? '1' : '0';
            displayArticle = fallback(undefined, queryToBoolean(routeParams.displayArticle), false) ? '1' : '0';
            displayComments = fallback(undefined, queryToBoolean(routeParams.displayComments), false) ? '1' : '0';
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
            const { app_key = '', redirect_url = ctx.req.origin + '/weibo/timeline/0' } = config.weibo;

            ctx.status = 302;
            ctx.set({
                'Cache-Control': 'no-cache',
            });
            ctx.set('redirect', `https://api.weibo.com/oauth2/authorize?client_id=${app_key}&redirect_uri=${redirect_url}${routeParams ? `&state=${routeParams}` : ''}`);
            return;
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
                    description = await weiboUtils.formatComments(ctx, description, item);
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
    } else if (uid === '0' || ctx.req.query()) {
        const { app_key = '', redirect_url = ctx.req.origin + '/weibo/timeline/0', app_secret = '' } = config.weibo;

        const code = ctx.req.query('code');
        const routeParams = ctx.req.query('state');
        if (code) {
            const rep = await got.post(`https://api.weibo.com/oauth2/access_token?client_id=${app_key}&client_secret=${app_secret}&code=${code}&redirect_uri=${redirect_url}&grant_type=authorization_code`);
            const token = rep.data.access_token;
            const uid = rep.data.uid;
            const expires_in = rep.data.expires_in;
            await cache.set('weibotimelineuid' + uid, token, expires_in);

            ctx.set({
                'Content-Type': 'text/html; charset=UTF-8',
                'Cache-Control': 'no-cache',
            });
            ctx.html(`<script>window.location = '/weibo/timeline/${uid}${routeParams ? `/${routeParams}` : ''}'</script>`);
        }
    } else {
        const { app_key = '', redirect_url = ctx.req.origin + '/weibo/timeline/0' } = config.weibo;

        ctx.status = 302;
        ctx.set({
            'Cache-Control': 'no-cache',
        });
        ctx.set('redirect', `https://api.weibo.com/oauth2/authorize?client_id=${app_key}&redirect_uri=${redirect_url}${routeParams ? `&state=${feature}/${routeParams.replaceAll('&', '%26')}` : ''}`);
    }
}
