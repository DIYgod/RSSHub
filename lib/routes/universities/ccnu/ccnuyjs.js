const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://gs.ccnu.edu.cn/zsgz/ssyjs.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.main-zyrx li ').slice(0, 10);

    ctx.state.data = {
        title: '华中师范大学研究生院',
        link,
        description: '华中师范大学研究生院通知公告',
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
