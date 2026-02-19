import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiArticleRootUrl, fetchData, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/tag/:id',
    categories: ['new-media'],
    example: '/huxiu/tag/291',
    parameters: { id: '标签 id，可在对应标签页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    name: '标签',
    maintainers: ['xyqfer', 'HenryQW', 'nczitzk', 'TimoYoung'],
    handler,
    description: `更多标签请参见 [标签](https://www.huxiu.com/tags)`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const apiUrl = new URL('/v3/tag/articleList', apiArticleRootUrl).href;
    const currentUrl = new URL(`tag/${id}.html`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            tag_id: id,
        },
    });

    const items = await processItems(response.data.datalist, limit, cache.tryGet);

    const data = await fetchData(currentUrl);

    return {
        item: items,
        ...data,
    };
}
