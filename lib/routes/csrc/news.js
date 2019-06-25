const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.csrc.gov.cn/pub/newsite/zjhxwfb/xwdd/';
    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const resultItem = $(".fl_list li")
        .map((index, elem) => {
            elem = $(elem);

            return {
                title:elem.find('a').attr('title'),
                date:elem.find('span').text(),
                link:url + elem.find('a').attr('href'),
                author: '证监会要闻',
            };
        })
        .get();

    ctx.state.data = {
        title: '证监会要闻',
        link: url,
        item: resultItem,
    };
};

