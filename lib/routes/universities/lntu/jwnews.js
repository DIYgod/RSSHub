const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://jwzx.lntu.edu.cn/index/jwgg.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.tr-ri li').slice(0, 10);

    ctx.state.data = {
        title: '辽宁工程技术大学教务公告',
        link: link,
        description: '辽宁工程技术大学教务公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('li a').text(),
                        link: item.find('li a').attr('href'),
                    };
                })
                .get(),
    };
};
