const got = require('@/utils/got');
const { baseUrl, fetchFriends, getPlurk } = require('./utils');

module.exports = async (ctx) => {
    const { lang = 'en' } = ctx.params;
    const { data: apiResponse } = await got(`${baseUrl}/PlurkTop/fetchOfficialPlurks`, {
        searchParams: {
            lang,
        },
    });

    const userIds = apiResponse.map((item) => item.user_id);
    const names = await fetchFriends(userIds);

    const items = await Promise.all(apiResponse.map((item) => getPlurk(`plurk:${item.plurk_id}`, item, names[item.user_id].display_name, ctx.cache.tryGet)));

    ctx.state.data = {
        title: 'Plurk News - Plurk',
        image: 'https://s.plurk.com/2c1574c02566f3b06e91.png',
        link: `${baseUrl}/news`,
        item: items,
    };
};
