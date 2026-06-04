import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiClubRootUrl, buildHuxiuRouteTitlePrefix, fetchApiRouteData, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/club/:id',
    name: '源流',
    categories: ['new-media'],
    example: '/huxiu/club/1161',
    parameters: { id: '源流 id，可在对应源流页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    maintainers: ['nczitzk', 'TimoYoung'],
    handler,
    description: '更多源流请参见 [源流](https://www.huxiu.com/club)',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL('v1/club/briefList', apiClubRootUrl).href;
    const currentUrl = new URL(`club/${id}.html`, rootUrl).href;

    const data = await fetchApiRouteData<{
        name: string;
        format_desc?: string;
        icon_path?: string;
        share_info?: {
            share_desc?: string;
            share_img?: string;
        };
    }>({
        currentUrl,
        apiUrl: new URL('v1/club/detail', apiClubRootUrl).href,
        form: {
            platform: 'www',
            club_id: id,
        },
        mapData: (data) => ({
            title: data.name,
            description: data.format_desc ?? data.share_info?.share_desc,
            image: data.icon_path ?? data.share_info?.share_img,
            titlePrefix: buildHuxiuRouteTitlePrefix(route.name),
        }),
    });

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            club_id: id,
            pagesize: limit,
        },
    });

    const items = await processItems(response.data.datalist, limit, cache.tryGet);

    return {
        item: items,
        ...data,
    };
}
