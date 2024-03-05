// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

const { rootUrl, apiMemberRootUrl, processItems, fetchData } = require('./util');

export default async (ctx) => {
    const { id, type = 'article' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const apiUrl = new URL(`web/${type}/${type}List`, apiMemberRootUrl).href;
    const currentUrl = new URL(`member/${id}${type === 'article' ? '' : `/${type}`}.html`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            uid: id,
        },
    });

    const items = await processItems(response.data.datalist, limit, cache.tryGet);

    const data = await fetchData(currentUrl);

    ctx.set('data', {
        item: items,
        ...data,
    });
};
