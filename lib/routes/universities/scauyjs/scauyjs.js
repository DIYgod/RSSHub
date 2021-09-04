const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://yzb.scau.edu.cn/2136/list1.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('#wp_news_w25 tr').slice(0, 10);

    ctx.state.data = {
        title: '华南农业大学研究生院',
        link: link,
        description: '华南农业大学研究生院通知公告',
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
