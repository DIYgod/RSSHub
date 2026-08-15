import type { Route } from '@/types';
import got from '@/utils/got';

import { apiRootUrl, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: '/tag/:id?',
    categories: ['new-media'],
    example: '/hk01/tag/2787',
    parameters: { id: '标签 id, 可在 URL 中找到' },
    radar: [
        {
            source: ['hk01.com/tag/:id', 'hk01.com/'],
        },
    ],
    name: '标签',
    maintainers: ['hoilc', 'Fatpandac', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '1';

    const currentUrl = `${rootUrl}/tag/${id}`;
    const apiUrl = `${apiRootUrl}/v2/feed/tag/${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.req.query('limit'));

    return {
        title: `${id} | 香港01`,
        link: currentUrl,
        item: items,
    };
}
