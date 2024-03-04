// @ts-nocheck
import cache from '@/utils/cache';
const { rootUrl, apiRootUrl, processItems, getInfo } = require('./util');

export default async (ctx) => {
    const name = ctx.req.param('name');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5;

    const apiUrl = new URL('v2/content/tag/tagList', apiRootUrl).href;
    const currentUrl = new URL(`label/${name}`, rootUrl).href;

    const items = await processItems(apiUrl, limit, cache.tryGet, {
        tag: name,
    });

    ctx.set('data', {
        item: items,
        ...(await getInfo(currentUrl, cache.tryGet)),
    });
};
