const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    // const area = ctx.params.area;
    const url = 'http://www.xswater.com/gongshui/channels/227.html';
    const response = await axios({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.ul-list li');

    ctx.state.data = {
        title: $('title').text(),
        link: 'http://www.xswater.com/gongshui/channels/227.html',
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        description: `萧山区停水通知：${item.find('a').text()}`,
                        pubDate: new Date(
                            item
                                .find('span')
                                .text()
                                .slice(1, 11)
                        ).toUTCString(),
                        link: `http://www.xswater.com${item.find('a').attr('href')}`,
                    };
                })
                .get(),
    };
};
