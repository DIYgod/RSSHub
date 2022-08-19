const got = require('@/utils/got');
const dayjs = require('dayjs');
const { baseUrl, getPlurk } = require('./utils');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const { data: apiResponse } = await got.post(`${baseUrl}/Search/search2`, {
        searchParams: {
            query: keyword,
            start_date: dayjs().subtract(1, 'year').format('YYYY/MM'),
            end_date: dayjs().format('YYYY/MM'),
        },
    });

    const users = apiResponse.users;
    const plurks = apiResponse.plurks;

    const items = await Promise.all(plurks.map((item) => getPlurk(`plurk:${item.plurk_id}`, item, users[item.user_id].display_name, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `Search "${keyword}" - Plurk`,
        description: 'Search messages on Plurk',
        image: 'https://s.plurk.com/e8266f512246cdbc2721.jpg',
        link: `${baseUrl}/search?q=${encodeURIComponent(keyword)}`,
        item: items,
    };
};
