// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

const { apiBriefRootUrl, processItems, fetchClubData } = require('./util');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL('club/briefList', apiBriefRootUrl).href;

    const { data, briefColumnId } = await fetchClubData(id);

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            club_id: id,
            brief_column_id: briefColumnId,
            pagesize: limit,
        },
    });

    ctx.set('json', response.data.datalist);

    const items = await processItems(response.data.datalist, limit, cache.tryGet);

    ctx.set('data', {
        item: items,
        ...data,
    });
};
