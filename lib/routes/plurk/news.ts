// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { baseUrl, fetchFriends, getPlurk } = require('./utils');

export default async (ctx) => {
    const { lang = 'en' } = ctx.req.param();
    const { data: apiResponse } = await got(`${baseUrl}/PlurkTop/fetchOfficialPlurks`, {
        searchParams: {
            lang,
        },
    });

    const userIds = apiResponse.map((item) => item.user_id);
    const names = await fetchFriends(userIds);

    const items = await Promise.all(apiResponse.map((item) => getPlurk(`plurk:${item.plurk_id}`, item, names[item.user_id].display_name, cache.tryGet)));

    ctx.set('data', {
        title: 'Plurk News - Plurk',
        image: 'https://s.plurk.com/2c1574c02566f3b06e91.png',
        link: `${baseUrl}/news`,
        item: items,
    });
};
