const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://admission.pku.edu.cn/zsxx/sszs/index.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.zsxx_cont_list li').slice(0, 10);

    ctx.state.data = {
        title: '北京大学研究生院',
        link: link,
        description: '北京大学研究生院通知公告',
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
