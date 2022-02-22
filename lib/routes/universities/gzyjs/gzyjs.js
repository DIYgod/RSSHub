const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://yjsy.gzhu.edu.cn/zsxx/zsdt/zsdt.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.picnews_cont li').slice(0, 10);

    ctx.state.data = {
        title: '广州大学研究生院',
        link,
        description: '广州大学研招网通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return { title: item.find('li a').text(), description: item.find('li a').text(), link: item.find('li a').attr('href') };
                })
                .get(),
    };
};
