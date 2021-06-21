const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.tynu.edu.cn/index/xyxw.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const list = $('.winstyle197529 a[class="c197529"]');

    ctx.state.data = {
        title: '太原师范学院校园新闻',
        link: link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.text(),
                        description: item.text(),
                        link: item.attr('href'),
                    };
                })
                .get(),
    };
};
