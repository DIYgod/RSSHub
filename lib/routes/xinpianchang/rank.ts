// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

const { rootUrl, getData, processItems } = require('./util');

export default async (ctx) => {
    const { category = 'all' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 60;

    const apiRankUrl = new URL(`api/xpc/v2/rank/${category}`, rootUrl).href;

    const { data: apiResponse } = await got(apiRankUrl);

    const current = apiResponse.data.list[0];
    const currentUrl = current.web_link;
    const currentName = `${current.code}-${current.year}-${current.index}`;

    const { data, response: currentResponse } = await getData(currentUrl, cache.tryGet);

    const buildId = currentResponse.match(/\/static\/(\w+)\/_buildManifest\.js/)[1];

    const apiUrl = new URL(`_next/data/${buildId}/rank/article/${currentName}.json`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    let items = response.pageProps.rankList;

    items = await processItems(items.slice(0, limit), cache.tryGet);

    ctx.set('data', {
        ...data,
        item: items,
    });
};
