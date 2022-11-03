const got = require('@/utils/got');
const { baseUrl, getPlurk } = require('./utils');

module.exports = async (ctx) => {
    const { data: apiResponse } = await got(`${baseUrl}/Stats/getAnonymousPlurks`, {
        searchParams: {
            offset: 0,
            limit: ctx.query.limit ? Number(ctx.query.limit) : 200,
        },
    });

    delete apiResponse.pids;
    delete apiResponse.count;

    const items = await Promise.all(Object.values(apiResponse).map((item) => getPlurk(`plurk:${item.plurk_id}`, item, 'ಠ_ಠ', ctx.cache.tryGet)));

    ctx.state.data = {
        title: 'Anonymous - Plurk',
        image: 'https://s.plurk.com/2c1574c02566f3b06e91.png',
        link: `${baseUrl}/anonymous`,
        item: items,
    };
};
