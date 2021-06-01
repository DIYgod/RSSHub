const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://www.law.pku.edu.cn/xwzx/ggtz/zsjx/index.htm';
    const response = await got.get(link);
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.list01 li');

    ctx.state.data = {
        title: '北京大学法学院招生教学公告',
        link: link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('li a').first().text(),
                        description: item.find('li a').first().text(),
                        link: item.find('li a').attr('href'),
                    };
                })
                .get(),
    };
};
