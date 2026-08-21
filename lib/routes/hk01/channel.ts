import type { Route } from '@/types';
import got from '@/utils/got';

import { apiRootUrl, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: '/channel/:id?',
    categories: ['new-media'],
    example: '/hk01/channel/391',
    parameters: { id: '子栏目 id, 可在 URL 中找到' },
    radar: [
        {
            source: ['hk01.com/channel/:id', 'hk01.com/'],
        },
    ],
    name: '子栏目',
    maintainers: ['hoilc', 'Fatpandac', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '1';

    const currentUrl = `${rootUrl}/channel/${id}`;
    const apiUrl = `${apiRootUrl}/v2/feed/category/${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.req.query('limit'));

    return {
        title: response.data.category ? `${response.data.category.publishName} | 香港01` : `Channel: ${id} | 香港01`,
        link: currentUrl,
        item: items,
        image: response.data.category ? response.data.category.icon : null,
    };
}
