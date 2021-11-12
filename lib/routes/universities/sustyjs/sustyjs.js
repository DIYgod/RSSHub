const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://gs.sustech.edu.cn/tonggao/p/1';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.block02 ul li').slice(0, 10);

    ctx.state.data = {
        title: '南方科技大学研究生院',
        link,
        description: '南方科技大学研招网通知公告',
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
