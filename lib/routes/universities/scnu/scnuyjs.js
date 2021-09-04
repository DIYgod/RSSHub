const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://yz.scnu.edu.cn/tongzhigonggao/ssgg/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.listmod div').slice(0, 10);

    ctx.state.data = {
        title: '华南师范大学研究生院',
        link: link,
        description: '华南师范大学研究生院通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return { title: item.find('div a').text(), description: item.find('div a').text(), link: item.find('div a').attr('href') };
                })
                .get(),
    };
};
