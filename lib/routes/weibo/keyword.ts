// @ts-nocheck
import cache from '@/utils/cache';
const querystring = require('querystring');
import got from '@/utils/got';
const weiboUtils = require('./utils');
import timezone from '@/utils/timezone';
import { fallback, queryToBoolean } from '@/utils/readable-social';
import { config } from '@/config';

export default async (ctx) => {
    const keyword = ctx.req.param('keyword');

    const data = await cache.tryGet(
        `weibo:keyword:${keyword}`,
        async () => {
            const _r = await got({
                method: 'get',
                url: `https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D61%26q%3D${encodeURIComponent(keyword)}%26t%3D0`,
                headers: {
                    Referer: `https://m.weibo.cn/p/searchall?containerid=100103type%3D1%26q%3D${encodeURIComponent(keyword)}`,
                    'MWeibo-Pwa': 1,
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
                },
            });
            return _r.data.data.cards;
        },
        config.cache.routeExpire,
        false
    );

    const routeParams = querystring.parse(ctx.req.param('routeParams'));
    ctx.set(
        'data',
        weiboUtils.sinaimgTvax({
            title: `又有人在微博提到${keyword}了`,
            link: `http://s.weibo.com/weibo/${encodeURIComponent(keyword)}&b=1&nodup=1`,
            description: `又有人在微博提到${keyword}了`,
            item: data.map((item) => {
                item.mblog.created_at = timezone(item.mblog.created_at, +8);
                if (item.mblog.retweeted_status && item.mblog.retweeted_status.created_at) {
                    item.mblog.retweeted_status.created_at = timezone(item.mblog.retweeted_status.created_at, +8);
                }
                return weiboUtils.formatExtended(ctx, item.mblog, undefined, {
                    showAuthorInTitle: fallback(undefined, queryToBoolean(routeParams.showAuthorInTitle), true),
                    showAuthorInDesc: fallback(undefined, queryToBoolean(routeParams.showAuthorInDesc), true),
                });
            }),
        })
    );
};
