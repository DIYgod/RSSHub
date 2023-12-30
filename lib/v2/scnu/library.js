const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://lib.scnu.edu.cn';
    const url = `${baseUrl}/news/zuixingonggao/`;
    const res = await got({
        method: 'get',
        url,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(res.data);
    const list = $('.article-list').find('li');

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: '华南师范大学图书馆 - 通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('a').text(),
                    pubDate: parseDate(item.find('.clock').text()),
                    link: item.find('a').attr('href'),
                };
            }),
    };
};
