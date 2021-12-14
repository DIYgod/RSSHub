const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://buaq.net';

    const response = await got({
        method: 'get',
        url: baseUrl,
    });
    const $ = cheerio.load(response.data); // 使用 cheerio 加载返回的 HTML
    const list = $('tr[class]');

    ctx.state.data = {
        title: `不安全文章 ~ 资讯`,
        link: `https://buaq.net/`,
        description: '不安全文章 ~ 资讯',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: $('font[size="4"]', item).children('a').text(),
                        pubDate: new Date($('font[size="1"]', item).children().first().text()).toUTCString(),
                        link: baseUrl + $('font[size="4"]', item).children('a').attr('href'),
                    };
                })
                .get(),
    };
};
