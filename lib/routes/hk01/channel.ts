import cache from '@/utils/cache';
import got from '@/utils/got';
import { rootUrl, apiRootUrl, ProcessItems } from './utils';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '1';

    const currentUrl = `${rootUrl}/channel/${id}`;
    const apiUrl = `${apiRootUrl}/v2/feed/category/${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.req.query('limit'), cache.tryGet);

    ctx.set('data', {
        title: response.data.category ? `${response.data.category.publishName} | 香港01` : `Channel: ${id} | 香港01`,
        link: currentUrl,
        item: items,
        image: response.data.category ? response.data.category.icon : null,
    });
};
