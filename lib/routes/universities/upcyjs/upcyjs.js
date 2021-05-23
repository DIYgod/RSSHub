const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://zs.gs.upc.edu.cn/sszs/list.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.list tr').slice(0, 10);

    ctx.state.data = {
        title: '中国石油大学研究生院',
        link: link,
        description: '中国石油大学研究生院通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return { title: item.find('tr a').text(), description: item.find('tr a').text(), link: item.find('tr a').attr('href') };
                })
                .get(),
    };
};
