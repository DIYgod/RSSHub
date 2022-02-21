const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://yz.ouc.edu.cn/5926/list.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.wp_article_list li').slice(0, 10);

    ctx.state.data = {
        title: '中国海洋大学研究生院',
        link,
        description: '中国海洋大学研究生院通知公告',
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
