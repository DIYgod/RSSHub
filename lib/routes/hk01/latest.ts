// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { rootUrl, apiRootUrl, ProcessItems } = require('./utils');

export default async (ctx) => {
    const currentUrl = `${rootUrl}/latest`;
    const apiUrl = `${apiRootUrl}/v2/page/latest`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.req.query('limit'), cache.tryGet);

    ctx.set('data', {
        title: '即時 | 香港01',
        link: currentUrl,
        item: items,
    });
};
