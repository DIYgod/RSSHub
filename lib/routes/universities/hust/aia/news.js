const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url').resolve;

module.exports = async (ctx) => {
    const link = 'http://aia.hust.edu.cn/yxxw.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.N02_list li dl').slice(0, 10);

    ctx.state.data = {
        title: '华科人工智能和自动化学院新闻',
        link: link,
        description: '华科人工智能和自动化学院新闻',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const day = item.find('.N02_list_Icon i').text();
                    item.find('.N02_list_Icon').find('i').remove();
                    const year_month = item.find('.N02_list_Icon').text();
                    return {
                        title: item.find('h4 a').text(),
                        description: item.find('dd p').text() || '华科人工智能和自动化学院新闻',
                        pubDate: new Date(year_month + ' ' + day).toUTCString(),
                        link: url(link, item.find('h4 a').attr('href')),
                    };
                })
                .get(),
    };
};
