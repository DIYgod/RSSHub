// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

const { rootUrl, processItems, fetchData } = require('./util');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const apiUrl = new URL('v2_action/tag_article_list', rootUrl).href;
    const currentUrl = new URL(`tags/${id}.html`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            tag_id: id,
        },
    });

    const items = await processItems(response.data, limit, cache.tryGet);

    const data = await fetchData(currentUrl);

    ctx.set('data', {
        item: items,
        ...data,
    });
};
