const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { cookieJar, processArticle } = require('./utils');
const baseUrl = 'http://stno1.playno1.com';

module.exports = async (ctx) => {
    const { catid = 'all' } = ctx.params;
    const url = `${baseUrl}/stno1/${catid}/`;
    const response = await got(url, {
        cookieJar,
    });
    const $ = cheerio.load(response.data);

    let items = $('.fallsBox')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.ftitle a').attr('title'),
                link: item.find('.ftitle a').attr('href'),
                pubDate: timezone(parseDate(item.find('.dateBox').text(), 'YYYY-MM-DD HH:mm'), 8),
                author: item.find('.dateBox span a').eq(0).text().trim(),
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
