// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { rootUrl, apiRootUrl, ProcessItems } = require('./utils');

export default async (ctx) => {
    const currentUrl = `${rootUrl}/hot`;
    const apiUrl = `${apiRootUrl}/v2/feed/hot`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.req.query('limit'), cache.tryGet);

    ctx.set('data', {
        title: '熱門新聞、全城熱話及社會時事 | 香港01',
        link: currentUrl,
        item: items,
    });
};
