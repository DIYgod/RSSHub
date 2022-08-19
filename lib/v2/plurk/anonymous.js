const got = require('@/utils/got');
const cheerio = require('cheerio');
const { baseUrl, getPlurk } = require('./utils');

module.exports = async (ctx) => {
    const { data: pageResponse } = await got(`${baseUrl}/anonymous`);
    const { data: apiResponse } = await got(`${baseUrl}/Stats/getAnonymousPlurks`, {
        searchParams: {
            offset: 0,
            limit: ctx.query.limit ? Number(ctx.query.limit) : 200,
        },
    });

    const $ = cheerio.load(pageResponse);

    delete apiResponse.pids;
    delete apiResponse.count;

    const items = await Promise.all(Object.values(apiResponse).map((item) => getPlurk(`plurk:${item.plurk_id}`, item, 'ಠ_ಠ', ctx.cache.tryGet)));

    ctx.state.data = {
        title: $('head title').text(),
        image: $('meta[property=og:image]').attr('content') || $('meta[name=msapplication-TileImage]').attr('content'),
        link: `${baseUrl}/anonymous`,
        item: items,
    };
};
