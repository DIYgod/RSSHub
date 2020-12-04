const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://yz.cuc.edu.cn/listWYFHY/list_0_1.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data, 'utf-8');
    const list = $('.notice_main_content2 td').slice(0, 10);

    ctx.state.data = {
        title: '中国传媒大学',
        link: link,
        description: '中国传媒大学研招网通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return { title: item.find('td a').text(), description: item.find('td a').text(), link: item.find('td a').attr('href') };
                })
                .get(),
    };
};
