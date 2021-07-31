const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.wzu.edu.cn/index/wdxw.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('#News-sidebar-b-nav').find('li').slice(0, 14);

    ctx.state.data = {
        title: '温大新闻',
        link: link,
        description: '温州大学',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return { title: item.find('li a').attr('title'), description: item.find('li a').attr('title'), link: item.find('li a').attr('href') };
                })
                .get(),
    };
};
