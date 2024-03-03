// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { baseUrl, getPlurk } = require('./utils');

export default async (ctx) => {
    const { data: apiResponse } = await got(`${baseUrl}/Stats/getAnonymousPlurks`, {
        searchParams: {
            offset: 0,
            limit: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 200,
        },
    });

    delete apiResponse.pids;
    delete apiResponse.count;

    const items = await Promise.all(Object.values(apiResponse).map((item) => getPlurk(`plurk:${item.plurk_id}`, item, 'ಠ_ಠ', cache.tryGet)));

    ctx.set('data', {
        title: 'Anonymous - Plurk',
        image: 'https://s.plurk.com/2c1574c02566f3b06e91.png',
        link: `${baseUrl}/anonymous`,
        item: items,
    });
};
