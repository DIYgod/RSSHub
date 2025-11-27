import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiArticleRootUrl, fetchData, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/collection/:id',
    categories: ['new-media'],
    example: '/huxiu/collection/212',
    parameters: { id: '文集 id，可在对应文集页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: true,
        supportScihub: false,
    },
    name: '文集',
    maintainers: ['AlexdanerZe', 'nczitzk'],
    handler,
    description: `更多文集请参见 [文集](https://www.huxiu.com/collection)`,
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

    const data = await fetchData(currentUrl);

    return {
        item: items,
        ...data,
    };
}
