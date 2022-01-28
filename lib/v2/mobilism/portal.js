const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const utils = require('./utils');

const get = (data) => {
    const $ = cheerio.load(data);
    const posts = $('div.span9 > section');
    const items = posts
        .map((index, item) => {
            item = $(item);
            const date = item.find('div.well > span.muted > em').text();
            return {
                title: item.find('div.page-header > h3').text(),
                link: new URL(item.find('div.well > a').attr('href'), 'https://forum.mobilism.org'),
                author: item.find('div.well > span.muted > em > strong').text().replace('Posted by: ', ''),
                description: item.find('div.well > div.postbody').text(),
                pubDate: timezone(utils.parseDate(date), 0),
            };
        })
        .get();
    return items;
};

module.exports = async (ctx) => {
    const { type } = ctx.params;
    const url = `https://forum.mobilism.org/portal.php?mode=articles&block=${type}&sk=t&sd=d&start=0`;
    let items = [];
    const response = await got.get(url);
    items = items.concat(get(response.data));
    ctx.state.data = {
        title: `Mobilism Portal ${utils.firstUpperCase(type)} Release`,
        link: url,
        description: `Mobilism Portal ${utils.firstUpperCase(type)} RSS`,
        item: items,
    };
};
