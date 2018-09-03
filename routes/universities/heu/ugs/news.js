const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://ugs.hrbeu.edu.cn/2821/list.htm',
        headers: {
            Referer: 'http://ugs.hrbeu.edu.cn',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.wp_article_list_table .border9');

    ctx.state.data = {
        title: '哈尔滨工程大学本科生院工作通知',
        link: 'http://ugs.hrbeu.edu.cn/2821/list.htm',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        pubDate: new Date(item.find('.date').text()).toUTCString(),
                        link: `http://ugs.hrbeu.edu.cn${item.find('a').attr('href')}`,
                    };
                })
                .get(),
    };
};
