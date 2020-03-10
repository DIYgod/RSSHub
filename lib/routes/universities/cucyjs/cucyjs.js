const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://yz.szu.edu.cn/sszs/gg.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.notice_main_content2 ').slice(0, 10);

    ctx.state.data = {
        title: '中国传媒大学',
        link: link,
        description: '中国传媒大学研招网通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return { description: item.find('a').text(), pubDate: 2090, link: item.find('a').attr('href') };
                })
                .get(),
    };
};
