import type { Data, Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

import { apiRootUrl, processItemList, rootUrl } from './util';

export const route: Route = {
    path: '/label/:name',
    categories: ['new-media'],
    example: '/cyzone/label/创业邦周报',
    parameters: { name: '标签名称，可在对应标签页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cyzone.cn/label/:name', 'cyzone.cn/'],
        },
    ],
    name: '标签',
    maintainers: ['LogicJake', 'nczitzk'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const name = ctx.req.param('name');
    const limit = getRouteLimit(ctx, 5);

    const apiUrl = new URL('v2/content/tag/tagList', apiRootUrl).href;
    const { data: response } = await got(apiUrl, {
        searchParams: { tag: name, size: limit },
    });
    const tag = response.data?.tag;
    if (!tag?.url) {
        throw new Error(`The Cyzone API did not provide metadata for tag ${name}`);
    }

    const items = await processItemList(response, limit);

    return {
        title: `${tag.tag} - 创业邦`,
        link: new URL(tag.url, rootUrl).href,
        language: 'zh-CN',
        image: tag.thumb ? new URL(tag.thumb, rootUrl).href : undefined,
        item: items,
    };
}
