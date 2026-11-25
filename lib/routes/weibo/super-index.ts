import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { md5 } from '@/utils/hash';
import ofetch from '@/utils/ofetch';

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
        requirePuppeteer: false,
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
    description: `| type      | 备注             |
| --------- | ---------------- |
| soul      | 精华             |
| video     | 视频（暂不支持） |
| album     | 相册（暂不支持） |
| hot_sort  | 热门             |
| sort_time | 最新帖子         |
| feed      | 最新评论         |`,
};

type ContainerData = {
    items: Array<{ category: string; data: { mblogid: string; user: { id: number } } }>;
    header: { data: { page_title: string } };
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'feed';
    const link = `https://weibo.com/p/${id}/super_index`;

    const containerData = await weiboUtils.tryWithCookies((cookies, verifier) =>
        cache.tryGet<ContainerData>(
            `weibo:super_index:container:${id}:${type}:${md5(cookies)}`,
            async () => {
                const page = await ofetch.raw(link, { headers: { Cookie: cookies } });
                const xsrfCookie = page.headers.getSetCookie().find((cookie) => cookie.startsWith('XSRF-TOKEN='));
                if (!xsrfCookie) {
                    throw new weiboUtils.RenewWeiboCookiesError('The super topic page did not set XSRF-TOKEN');
                }
                const xsrfToken = xsrfCookie.split(';', 1)[0].split('=', 2)[1];
                const data = await ofetch('https://weibo.com/ajax_proxy/chaohua/page', {
                    query: { flowId: `${id}_-_${type}` },
                    headers: {
                        Referer: link,
                        Cookie: `${cookies}; XSRF-TOKEN=${xsrfToken}`,
                        'X-XSRF-TOKEN': xsrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                verifier({ data });
                return data;
            },
            config.cache.routeExpire,
            false
        )
    );

    const items = await pMap(
        containerData.items.filter((item) => item.category === 'feed'),
        async ({ data }) => {
            const status = await cache.tryGet(`weibo:super_index:complete:${data.mblogid}`, () => weiboUtils.getShowData(data.user.id, data.mblogid));
            status.created_at = weiboUtils.parseCreatedAt(status.created_at);
            return weiboUtils.formatExtended(ctx, status, undefined);
        },
        { concurrency: 3 }
    );

    const pageTitle = containerData.header.data.page_title;
    return weiboUtils.sinaimgTvax({
        title: `微博超话 - ${pageTitle}`,
        link,
        description: `#${pageTitle}# 的超话`,
        item: items,
    });
}
