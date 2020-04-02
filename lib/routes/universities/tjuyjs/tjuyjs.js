const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://yz.tongji.edu.cn/zsxw/ggtz.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.list_main_content li').slice(0, 10);

    ctx.state.data = {
        title: '同济大学研究生院',
        link: link,
        description: '同济大学研究生院通知公告',
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
