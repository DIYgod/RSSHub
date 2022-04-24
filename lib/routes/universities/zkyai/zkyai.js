const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://ai.ucas.ac.cn/index.php/zh-cn/tzgg';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.b-list li').slice(0, 10);

    ctx.state.data = {
        title: '中科院人工智能所',
        link,
        description: '中科院人工智能通知公告',
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
