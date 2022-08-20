const got = require('@/utils/got');
const cheerio = require('cheerio');
const { baseUrl, fetchFriends, getPlurk } = require('./utils');

module.exports = async (ctx) => {
    const { topic } = ctx.params;
    const { data: pageResponse } = await got(`${baseUrl}/topic/${topic}`);
    const { data: apiResponse } = await got(`${baseUrl}/topic/getPlurks`, {
        searchParams: {
            topic,
            offset: 0,
            limit: ctx.query.limit ? Number(ctx.query.limit) : 30,
        },
    });

    const $ = cheerio.load(pageResponse);

    delete apiResponse.pids;
    delete apiResponse.count;

    const userIds = Object.values(apiResponse).map((item) => item.user_id);
    const names = await fetchFriends(userIds);

    const items = await Promise.all(Object.values(apiResponse).map((item) => getPlurk(`plurk:${item.plurk_id}`, item, names[item.user_id].display_name, ctx.cache.tryGet)));

    ctx.state.data = {
        title: $('head title').text(),
        description: $('meta[property=og:description]').attr('content'),
        image: $('meta[property=og:image]').attr('content') || $('meta[name=msapplication-TileImage]').attr('content'),
        link: `${baseUrl}/topic/${topic}`,
        item: items,
    };
};
