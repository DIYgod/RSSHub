const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://gschool.ecust.edu.cn/_s51/7962/list.psp';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.wp_article_list li').slice(0, 10);

    ctx.state.data = {
        title: '华东理工大学研究生院',
        link,
        description: '华东理工大学研究生院通知公告',
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
