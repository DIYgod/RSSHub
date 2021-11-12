const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://uowji.ccnu.edu.cn/tzgg.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.zy-mainxrx li ').slice(0, 10);

    ctx.state.data = {
        title: '华中师范大学伍论贡学院',
        link,
        description: '华中师范大学伍论贡学院通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return { title: item.find('lI A').text(), description: item.find('lI A').text(), link: item.find('lI A').attr('href') };
                })
                .get(),
    };
};
