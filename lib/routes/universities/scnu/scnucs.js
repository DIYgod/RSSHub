const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://ss.scnu.edu.cn/tongzhigonggao/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.listshow li').slice(0, 10);

    ctx.state.data = {
        title: '华南师范大学软件学院',
        link,
        description: '华南师范大学软件学院',
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
