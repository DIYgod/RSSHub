const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = 'http://www.djsw.com.cn/news/tstz/index.html';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('#cntR li');

    ctx.state.data = {
        title: $('title').text() || '停水通知 - 东莞市东江水务有限公司',
        link: 'http://www.djsw.com.cn/news/tstz/index.html',
        description: $('title').text() || '停水通知 - 东莞市东江水务有限公司',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        description: `东莞市停水通知：${item.find('a').text()}`,
                        pubDate: parseDate($(item.contents()[1]).text().slice(1, -1)),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
