const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { type } = ctx.params;
    const baseUrl = 'https://aia.hust.edu.cn';
    const link = `${baseUrl}/tzgg${type ? `/${type}` : ''}.htm`;
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.list li');
    const title = $('title').text();

    ctx.state.data = {
        title,
        link,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('a h2').text(),
                    description: item.find('a div').text() || title,
                    pubDate: parseDate(item.find('.date3').text(), 'DDYYYY-MM'),
                    link: new URL(item.find('a').attr('href'), link).href,
                };
            }),
    };
};
