const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://yz.szu.edu.cn/sszs/gg.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.list li').slice(0, 10);

    ctx.state.data = {
        title: '深圳大学',
        link: link,
        description: '深圳大学研招网通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return { title: item.find('li A').text(), description: item.find('li A').text(), link: item.find('li A').attr('href') };
                })
                .get(),
    };
};
