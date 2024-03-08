import cache from '@/utils/cache';
import got from '@/utils/got';
import { rootUrl, apiRootUrl, ProcessItems } from './utils';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '1';

    const currentUrl = `${rootUrl}/tag/${id}`;
    const apiUrl = `${apiRootUrl}/v2/feed/tag/${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.req.query('limit'), cache.tryGet);

    ctx.set('data', {
        title: `${id} | 香港01`,
        link: currentUrl,
        item: items,
    });
};
