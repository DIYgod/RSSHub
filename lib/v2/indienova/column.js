const got = require('@/utils/got');
const cheerio = require('cheerio');
const { baseUrl, parseList, parseItem } = require('./utils');

module.exports = async (ctx) => {
    const { columnId } = ctx.params;

    const { data: response, url: link } = await got(`${baseUrl}/column/${columnId}`);
    const $ = cheerio.load(response);

    const list = parseList($);

    const items = await Promise.all(list.map((item) => ctx.cache.tryGet(item.link, () => parseItem(item))));

    ctx.state.data = {
        title: $('head title').text(),
        link,
        item: items,
    };
};
