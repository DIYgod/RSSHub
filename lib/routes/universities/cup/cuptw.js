const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://www.cup.edu.cn/tuanwei/tzgg/index.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.articleList5 li').slice(0, 10);

    ctx.state.data = {
        title: '中国石油大学(北京)团委',
        link: link,
        description: '中国石油大学(北京)团委通知公告',
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
