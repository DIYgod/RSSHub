const got = require('@/utils/got');
const { baseUrl, getPlurk } = require('./utils');

module.exports = async (ctx) => {
    const { data: apiResponse } = await got(`${baseUrl}/hotlinks/getLinks`, {
        searchParams: {
            offset: 0,
            count: ctx.query.limit ? Number(ctx.query.limit) : 30,
        },
    });

    const items = await Promise.all(apiResponse.map((item) => getPlurk(item.link_url.startsWith('https://www.plurk.com/p/') ? item.link_url : `plurk:${item.link_url}`, item, null, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `Hot Links - Plurk`,
        image: 'https://s.plurk.com/2c1574c02566f3b06e91.png',
        link: `${baseUrl}/hotlinks`,
        item: items,
    };
};
