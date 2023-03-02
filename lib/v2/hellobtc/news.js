const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootUrl = 'https://www.hellobtc.com';

module.exports = async (ctx) => {
    const url = `${rootUrl}/news`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const items = $('nav.js-nav')
        .find('div.item')
        .map((_, item) => ({
            title: $(item).find('h2').text(),
            link: $(item).find('a').attr('href'),
            description: $(item).find('div.sub').text(),
            pubDate: timezone(parseDate($(item).find('span.date').text(), 'MM-DD HH:mm'), +8),
        }))
        .filter((item) => item)
        .get();

    ctx.state.data = {
        title: `白话区块链 - 快讯`,
        link: url,
        item: items,
    };
};
