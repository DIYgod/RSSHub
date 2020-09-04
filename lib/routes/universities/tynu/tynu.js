const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.tynu.edu.cn/index/xyxw.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const list = $('.winstyle197529 td:nth-child(2)');

    ctx.state.data = {
        title: '太原师范学院校园新闻',
        link: link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a[class=c197529]').text(),
                        description: item.find('a[class=c197529]').text(),
                        link: item.find('a[class=c197529]').attr('href'),
                    };
                })
                .get(),
    };
};