import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiClubRootUrl, fetchClubData, processItems } from './util';

export const route: Route = {
    path: '/club/:id',
    name: '源流',
    categories: ['new-media'],
    example: '/huxiu/club/2029',
    parameters: { id: '源流 id，可在对应源流页 URL 中找到' },
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL('v1/club/briefList', apiClubRootUrl).href;

    const data = await fetchClubData(id);

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            club_id: id,
            pagesize: limit,
        },
    });

    const items = await processItems(response.data.datalist, limit, cache.tryGet);

    return {
        item: items,
        ...data,
    };
}
