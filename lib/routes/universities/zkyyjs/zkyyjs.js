const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.ia.cas.cn/yjsjy/zs/sszs/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.col-md-9 li').slice(0, 10);

    ctx.state.data = {
        title: '中科院自动化所',
        link,
        description: '中科院自动化所通知公告',
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
