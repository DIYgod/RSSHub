// @ts-nocheck
import cache from '@/utils/cache';
const { rootUrl, fetchItems } = require('./util');

export default async (ctx) => {
    const { category = 'weekvisit' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(`top/${category.split(/_/)[0]}_1.html`, rootUrl).href;

    ctx.set('data', await fetchItems(limit, currentUrl, cache.tryGet));
};
