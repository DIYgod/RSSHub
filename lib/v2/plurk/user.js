const got = require('@/utils/got');
const cheerio = require('cheerio');
const { baseUrl, fetchFriends, getPlurk } = require('./utils');

module.exports = async (ctx) => {
    const { user } = ctx.params;
    const { data: pageResponse } = await got(`${baseUrl}/${user}`);

    const $ = cheerio.load(pageResponse);

    const publicPlurks = JSON.parse(
        $('body script[type]')
            .text()
            .match(/PUBLIC_PLURKS = (.*);\nPINNED_PLURK/)[1]
            .replace(/new Date\((.*?)\)/g, '$1')
            .replace(/null/g, '""')
    );

    const userIds = publicPlurks.map((item) => item.user_id);
    const names = await fetchFriends(userIds);

    const items = await Promise.all(publicPlurks.map((item) => getPlurk(`plurk:${item.plurk_id}`, item, names[item.user_id].display_name, ctx.cache.tryGet)));

    ctx.state.data = {
        title: $('head title').text(),
        description: $('meta[property=og:description]').attr('content'),
        image: $('meta[property=og:image]').attr('content') || $('meta[name=msapplication-TileImage]').attr('content'),
        link: `${baseUrl}/${user}`,
        item: items,
    };
};
