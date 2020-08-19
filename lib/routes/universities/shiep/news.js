const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://news.shiep.edu.cn/notice/list.htm',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div[class="fields pr_fields"]');

    ctx.state.data = {
        title: '上海电力大学-新闻网',
        link: 'http://news.shiep.edu.cn/notice/list.htm',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
