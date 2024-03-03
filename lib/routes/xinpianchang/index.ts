// @ts-nocheck
import cache from '@/utils/cache';
const { rootUrl, getData, processItems } = require('./util');

export default async (ctx) => {
    const { params = 'article-0-0-all-all-0-0-score' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 60;

    const currentUrl = new URL(`discover/${params}`, rootUrl).href;

    const { data, response } = await getData(currentUrl, cache.tryGet);

    let items = JSON.parse(response.match(/"list":(\[.*?]),"total"/)[1]);

    items = await processItems(items.slice(0, limit), cache.tryGet);

    ctx.set('data', {
        ...data,
        item: items,
    });
};
