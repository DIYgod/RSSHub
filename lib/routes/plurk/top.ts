// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { baseUrl, getPlurk } = require('./utils');

const categoryList = new Set(['topReplurks', 'topFavorites', 'topResponded']);

export default async (ctx) => {
    const { category = 'topReplurks', lang = 'en' } = ctx.req.param();
    if (!categoryList.has(category)) {
        throw new Error(`Invalid category: ${category}`);
    }

    const { data: apiResponse } = await got(`${baseUrl}/Stats/${category}`, {
        searchParams: {
            period: 'day',
            lang,
            limit: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 90,
        },
    });

    const items = await Promise.all(apiResponse.stats.map((item) => item[1]).map((item) => getPlurk(`plurk:${item.plurk_id}`, item, item.owner.display_name, cache.tryGet)));

    ctx.set('data', {
        title: 'Top Plurk - Plurk',
        image: 'https://s.plurk.com/2c1574c02566f3b06e91.png',
        link: `${baseUrl}/top#${category}`,
        item: items,
        language: lang,
    });
};
