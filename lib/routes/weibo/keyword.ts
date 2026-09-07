import querystring from 'node:querystring';

import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { fallback, queryToBoolean } from '@/utils/readable-social';

import weiboUtils from './utils';

export const route: Route = {
    path: '/keyword/:keyword/:routeParams?',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/weibo/keyword/RSSHub',
    parameters: { keyword: '你想订阅的微博关键词', routeParams: '额外参数；请参阅上面的说明和表格' },
    features: {
        requireConfig: [
            {
                name: 'WEIBO_COOKIES',
                optional: true,
                description: '',
            },
        ],
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '关键词',
    maintainers: ['DIYgod', 'Rongronggg9'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');

    const data = await weiboUtils.tryWithCookies((cookies, verifier) =>
        cache.tryGet(
            `weibo:keyword-statuses:${keyword}`,
            async () => {
                const _r = await got({
                    method: 'get',
                    url: `https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D61%26q%3D${encodeURIComponent(keyword)}%26t%3D0`,
                    headers: {
                        Referer: `https://m.weibo.cn/p/searchall?containerid=100103type%3D1%26q%3D${encodeURIComponent(keyword)}`,
                        Cookie: cookies,
                        ...weiboUtils.apiHeaders,
                    },
                });
                verifier(_r);
                const cards = _r.data?.data?.cards;
                if (!Array.isArray(cards)) {
                    throw new TypeError(_r.data?.msg || 'Weibo keyword search returned an invalid response.');
                }
                const statuses = cards.filter((card) => card.mblog).map((card) => card.mblog);
                if (!statuses.length) {
                    const message = 'Weibo keyword search returned no posts. Please retry later or check the keyword on Weibo.';
                    if (!config.weibo.cookies) {
                        // Expired visitor sessions can return ok=1 with only a "no results" card.
                        throw new weiboUtils.RenewWeiboCookiesError(message);
                    }
                    throw new Error(message);
                }
                return statuses;
            },
            config.cache.routeExpire,
            false
        )
    );

    const routeParams = querystring.parse(ctx.req.param('routeParams'));

    return weiboUtils.sinaimgTvax({
        title: `又有人在微博提到${keyword}了`,
        link: `http://s.weibo.com/weibo/${encodeURIComponent(keyword)}&b=1&nodup=1`,
        description: `又有人在微博提到${keyword}了`,
        item: data.map((status) => {
            const item = structuredClone(status);
            if (item.created_at) {
                item.created_at = parseDate(item.created_at);
            }
            if (item.retweeted_status?.created_at) {
                item.retweeted_status.created_at = parseDate(item.retweeted_status.created_at);
            }
            return weiboUtils.formatExtended(ctx, item, undefined, {
                showAuthorInTitle: fallback(undefined, queryToBoolean(routeParams.showAuthorInTitle), true),
                showAuthorInDesc: fallback(undefined, queryToBoolean(routeParams.showAuthorInDesc), true),
            });
        }),
    });
}
