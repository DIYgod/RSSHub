const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://yz.kaoyan.com/ecnu/tiaoji/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.subList li').slice(0, 10);

    ctx.state.data = {
        title: '华东师范大学研究生院',
        link,
        description: '华东师范大学研究生调剂信息',
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
