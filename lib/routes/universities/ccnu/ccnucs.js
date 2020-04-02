const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://cs.ccnu.edu.cn/xygk/xytg.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.NewsList li ').slice(0, 10);

    ctx.state.data = {
        title: '华中师范大学计算机学院',
        link: link,
        description: '华中师范大学计算机学院通知公告',
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
