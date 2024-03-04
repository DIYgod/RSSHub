// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

const { rootUrl, apiSearchRootUrl, generateSignature, processItems, fetchData } = require('./util');

export default async (ctx) => {
    const keyword = ctx.req.param('keyword');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL('api/article', apiSearchRootUrl).href;
    const currentUrl = rootUrl;

    const { data: response } = await got.post(apiUrl, {
        searchParams: {
            platform: 'www',
            s: keyword,
            sort: '',
            page: 1,
            pagesize: limit,
            appid: 'hx_search_202303',
            ...generateSignature(),
        },
    });

    const items = await processItems(response.data.datalist, limit, cache.tryGet);

    const data = await fetchData(currentUrl);
    data.title = `${keyword}-搜索结果-${data.title}`;

    ctx.set('json', response.data.datalist);

    ctx.set('data', {
        item: items,
        ...data,
    });
};
