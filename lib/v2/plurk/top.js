const got = require('@/utils/got');
const { baseUrl, getPlurk } = require('./utils');

const categoryList = ['topReplurks', 'topFavorites', 'topResponded'];

module.exports = async (ctx) => {
    const { category = 'topReplurks', lang = 'en' } = ctx.params;
    if (!categoryList.includes(category)) {
        throw Error(`Invalid category: ${category}`);
    }

    const { data: apiResponse } = await got(`${baseUrl}/Stats/${category}`, {
        searchParams: {
            period: 'day',
            lang,
            limit: ctx.query.limit ? Number(ctx.query.limit) : 90,
        },
    });

    const items = await Promise.all(apiResponse.stats.map((item) => item[1]).map((item) => getPlurk(`plurk:${item.plurk_id}`, item, item.owner.display_name, ctx.cache.tryGet)));

    ctx.state.data = {
        title: 'Top Plurk - Plurk',
        image: 'https://s.plurk.com/2c1574c02566f3b06e91.png',
        link: `${baseUrl}/top#${category}`,
        item: items,
        language: lang,
    };
};
