// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const weiboUtils = require('./utils');
import queryString from 'query-string';
import { config } from '@/config';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'feed';

    const containerData = await cache.tryGet(
        `weibo:super_index:container:${id}:${type}`,
        async () => {
            const _r = await got('https://m.weibo.cn/api/container/getIndex', {
                searchParams: queryString.stringify({
                    containerid: `${id}_-_${type}`,
                    luicode: '10000011',
                    lfid: `${id}_-_main`,
                }),
                headers: {
                    Referer: `https://m.weibo.cn/p/index?containerid=${id}_-_soul&luicode=10000011&lfid=${id}_-_main`,
                    'MWeibo-Pwa': '1',
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            return _r.data.data;
        },
        config.cache.routeExpire,
        false
    );

    const resultItems = [];

    for (const card of containerData.cards) {
        if (!('card_group' in card)) {
            continue;
        }
        for (const mblogCard of card.card_group) {
            if (mblogCard.card_type === '9' && 'mblog' in mblogCard) {
                const mblog = mblogCard.mblog;
                const formatExtended = weiboUtils.formatExtended(ctx, mblog);
                resultItems.push(formatExtended);
            }
        }
    }

    ctx.set(
        'data',
        weiboUtils.sinaimgTvax({
            title: `微博超话 - ${containerData.pageInfo.page_title}`,
            link: `https://weibo.com/p/${id}/super_index`,
            description: `#${containerData.pageInfo.page_title}# 的超话`,
            item: resultItems,
        })
    );
};
