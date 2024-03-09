import cache from '@/utils/cache';
import got from '@/utils/got';

import { rootUrl, apiArticleRootUrl, processItems, fetchData } from './util';

export default async (ctx) => {
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

    ctx.set('data', {
        item: items,
        ...data,
    });
};
