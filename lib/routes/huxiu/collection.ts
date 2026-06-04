import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiArticleRootUrl, buildHuxiuRouteTitlePrefix, fetchApiRouteData, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/collection/:id',
    categories: ['new-media'],
    example: '/huxiu/collection/212',
    parameters: { id: '文集 id，可在对应文集页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    name: '文集',
    maintainers: ['AlexdanerZe', 'nczitzk'],
    handler,
    description: '更多文集请参见 [文集](https://www.huxiu.com/collection)',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const apiUrl = new URL('web/collection/articleList', apiArticleRootUrl).href;
    const currentUrl = new URL(`collection/${id}.html`, rootUrl).href;
    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            collection_id: id,
        },
    });

    const items = await processItems(response.data.datalist, limit, cache.tryGet);

    const data = await fetchApiRouteData<{
        name: string;
        summary?: string;
        icon?: string;
        head_img?: string;
    }>({
        currentUrl,
        apiUrl: new URL('web/collection/detail', apiArticleRootUrl).href,
        form: {
            platform: 'www',
            collection_id: id,
        },
        mapData: (data) => ({
            title: data.name,
            description: data.summary,
            image: data.head_img || (data.icon ? new URL(data.icon, rootUrl).href : undefined),
            titlePrefix: buildHuxiuRouteTitlePrefix(route.name),
        }),
    });

    return {
        item: items,
        ...data,
    };
}
