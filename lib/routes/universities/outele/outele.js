const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://it.ouc.edu.cn/_s381/16619/list.psp';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.common-lists li').slice(0, 10);

    ctx.state.data = {
        title: '中国海洋大学信电学院',
        link,
        description: '中国海洋大学信电学院通知公告',
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
