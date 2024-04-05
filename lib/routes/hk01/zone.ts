import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { rootUrl, apiRootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/zone/:id?',
    radar: [
        {
            source: ['hk01.com/zone/:id', 'hk01.com/'],
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '1';

    const currentUrl = `${rootUrl}/zone/${id}`;
    const apiUrl = `${apiRootUrl}/v2/feed/zone/${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.req.query('limit'), cache.tryGet);

    return {
        title: `${response.data.category.publishName} | 香港01`,
        link: currentUrl,
        item: items,
        image: response.data.category.icon,
    };
}
