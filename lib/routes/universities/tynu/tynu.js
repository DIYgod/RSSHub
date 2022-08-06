const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.tynu.edu.cn/index/tzgg.htm',
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('h3[class = text-uppercase]');
    const newsLink = $('div[class=news_content]').find($('a')).attr('href');

    ctx.state.data = {
        title: '太原师范学院通知公告',
        link: 'http://www.tynu.edu.cn/index/tzgg.htm',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.text(),
                        link: newsLink.slice(2),
                    };
                })
                .get(),
    };
};
