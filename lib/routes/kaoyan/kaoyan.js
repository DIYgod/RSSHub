const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://tiaoji.kaoyan.com/xinxi/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.areaZslist li').slice(0, 10);

    ctx.state.data = {
        title: '考研帮调剂信息',
        link,
        description: '考研帮调剂信息',
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
