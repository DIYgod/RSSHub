const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://www.douban.com/explore',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.item');

    ctx.state.data = {
        title: '豆瓣今日精选',
        link: 'https://www.douban.com/explore',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item
                            .find('.title a')
                            .first()
                            .text(),
                        description: `作者：${item
                            .find('.usr-pic a')
                            .last()
                            .text()}<br>描述：${item.find('.content p').text()}<br><img referrerpolicy="no-referrer" src="${item
                            .find('.cover')
                            .css('background-image')
                            .replace('url(', '')
                            .replace(')', '')}">`,
                        link: item.find('.title a').attr('href'),
                    };
                })
                .get(),
    };
};
