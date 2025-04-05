import { Route } from '@/types';
import cache from '@/utils/cache';
import querystring from 'querystring';
import got from '@/utils/got';
import { config } from '@/config';
import weiboUtils from './utils';
import { fallback, queryToBoolean } from '@/utils/readable-social';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/friends/:routeParams?',
    categories: ['social-media'],
    example: '/weibo/friends',
    parameters: { routeParams: '额外参数；请参阅上面的说明和表格' },
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
            target: '/friends',
        },
    ],
    name: '最新关注时间线',
    maintainers: ['CaoMeiYouRen'],
    handler,
    url: 'weibo.com/',
    description: `::: warning
  此方案必须使用用户\`Cookie\`进行抓取

  因微博 cookies 的过期与更新方案未经验证，部署一次 Cookie 的有效时长未知

  微博用户 Cookie 的配置可参照部署文档
:::`,
};

async function handler(ctx) {
    if (!config.weibo.cookies) {
        throw new ConfigNotFoundError('Weibo Friends Timeline is not available due to the absense of [Weibo Cookies]. Check <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config tutorial</a>');
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
        `weibo:friends:login-user`,
        async () => {
            const _r = await got({
                method: 'get',
                url: 'https://m.weibo.cn/api/config',
                headers: {
                    Referer: `https://m.weibo.cn/`,
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
    const title = `${name} 的 最新关注时间线`;

    const responseData = await cache.tryGet(
        `weibo:friends:index:${uid}`,
        async () => {
            const _r = await got({
                method: 'get',
                url: 'https://m.weibo.cn/feed/friends',
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
                description = await weiboUtils.formatComments(ctx, description, item, '0');
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

    return weiboUtils.sinaimgTvax({
        title,
        link: `https://weibo.com`,
        item: resultItems,
    });
}
