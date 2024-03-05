// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

const { rootUrl, apiMomentRootUrl, processItems, fetchData } = require('./util');

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL('web-v2/moment/feed', apiMomentRootUrl).href;
    const currentUrl = new URL('moment', rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
        },
    });

    const items = await processItems(response.data.moment_list.datalist[0].datalist, limit, cache.tryGet);

    const data = await fetchData(currentUrl);

    ctx.set('data', {
        item: items,
        ...data,
    });
};
