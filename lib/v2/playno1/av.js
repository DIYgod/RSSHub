const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { cookieJar, processArticle } = require('./utils');
const baseUrl = 'http://www.playno1.com';

module.exports = async (ctx) => {
    const { catid = '78' } = ctx.params;
    const url = `${baseUrl}/portal.php?mod=list&catid=${catid}`;
    const response = await got(url, {
        cookieJar,
    });
    const $ = cheerio.load(response.data);

    let items = $('.fire_float')
        .toArray()
        .filter((i) => $(i).text().length)
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3 a').attr('title'),
                link: item.find('h3 a').attr('href'),
                pubDate: timezone(parseDate(item.find('.fire_left').text()), 8),
                author: item
                    .find('.fire_right')
                    .text()
                    .match(/作者：(.*)\s*\|/)[1]
                    .trim(),
            };
        });

    items = await processArticle(items, ctx.cache);

    ctx.state.data = {
        title: $('head title').text(),
        link: url,
        item: items,
        language: 'zh-TW',
    };
};
