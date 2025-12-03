import queryString from 'query-string';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import weiboUtils from './utils';

export const route: Route = {
    path: '/super_index/:id/:type?/:routeParams?',
    categories: ['social-media'],
    example: '/weibo/super_index/1008084989d223732bf6f02f75ea30efad58a9/sort_time',
    parameters: { id: '超话ID', type: '类型：见下表', routeParams: '额外参数；请参阅上面的说明和表格' },
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
    radar: [
        {
            source: ['weibo.com/p/:id/super_index'],
            target: '/super_index/:id',
        },
    ],
    name: '超话',
    maintainers: ['zengxs', 'Rongronggg9'],
    handler,
    description: `| type       | 备注             |
| ---------- | ---------------- |
| soul       | 精华             |
| video      | 视频（暂不支持） |
| album      | 相册（暂不支持） |
| hot\_sort  | 热门             |
| sort\_time | 最新帖子         |
| feed       | 最新评论         |`,
};

interface Card {
    card_group?: Card[];
}

async function handler(ctx) {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'feed';

    const containerData = (await weiboUtils.tryWithCookies((cookies, verifier) =>
        cache.tryGet(
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
                        Cookie: cookies,
                        ...weiboUtils.apiHeaders,
                    },
                });
                verifier(_r);
                return _r.data.data;
            },
            config.cache.routeExpire,
            false
        )
    )) as {
        cards?: Card[];
        pageInfo?: {
            page_title: string;
        };
    };

    const resultItems = [];

    function handleCard(ctx, card, resultItems) {
        if (card.card_type === '9' && 'mblog' in card) {
            const formatExtended = weiboUtils.formatExtended(ctx, card.mblog, undefined);
            resultItems.push(formatExtended);
        }
    }
    for (const card of containerData?.cards ?? []) {
        handleCard(ctx, card, resultItems);
        if (!('card_group' in card)) {
            continue;
        }
        for (const mblogCard of card.card_group!) {
            handleCard(ctx, mblogCard, resultItems);
        }
    }

    return weiboUtils.sinaimgTvax({
        title: `微博超话 - ${containerData?.pageInfo?.page_title}`,
        link: `https://weibo.com/p/${id}/super_index`,
        description: `#${containerData?.pageInfo?.page_title}# 的超话`,
        item: resultItems,
    });
}
