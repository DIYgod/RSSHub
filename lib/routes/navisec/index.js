const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://bowen.navisec.it/';
    const response = await got({
        method: 'get',
        url: baseUrl,
    });
    const $ = cheerio.load(response.data); // 使用 cheerio 加载返回的 HTML
    const list = $('tbody tr');
    ctx.state.data = {
        title: `纳威安全导航 ~ 资讯`,
        link: `https://bowen.navisec.it/`,
        description: '纳威安全导航 ~ 资讯',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: $('a', item).text(),
                        link: $('a', item).attr('href'),
                        pubDate: new Date($('td', item).last().text()).toUTCString(),
                    };
                })
                .get(),
    };
};
