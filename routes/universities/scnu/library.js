const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await axios({
        method: 'get',
        url: 'https://lib.scnu.edu.cn/news/zuixingonggao',
        headers: {
            Referer: 'https://lib.scnu.edu.cn',
        },
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('.article-list').find('li');

    ctx.state.data = {
        title: $('title').text(),
        link: 'https://lib.scnu.edu.cn/news/zuixingonggao',
        description: '华南师范大学图书馆 - 通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        pubDate: new Date(item.find('.clock').text()).toUTCString(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
