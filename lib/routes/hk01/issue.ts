import type { Route } from '@/types';
import got from '@/utils/got';

import { apiRootUrl, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: '/issue/:id?',
    categories: ['new-media'],
    example: '/hk01/issue/649',
    parameters: { id: '专题 id, 可在 URL 中找到' },
    radar: [
        {
            source: ['hk01.com/issue/:id', 'hk01.com/'],
        },
    ],
    name: '专题',
    maintainers: ['hoilc', 'Fatpandac', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '649';

    const currentUrl = `${rootUrl}/issue/${id}`;
    const apiUrl = `${apiRootUrl}/v2/issues/${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.blocks[0].articles, ctx.req.query('limit'));

    return {
        title: `${response.data.title} | 香港01`,
        link: currentUrl,
        item: items,
    };
}
