const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://zdhxy.shiep.edu.cn/2002/list.htm',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div[class="fields pr_fields"]');

    ctx.state.data = {
        title: '上海电力大学-自动化学院-学院公告',
        link: 'https://zdhxy.shiep.edu.cn/2002/list.htm',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        link: item.find('a').attr('href'),
                        pubDate: item.find('span.Article_PublishDate').text(),
                    };
                })
                .get(),
    };
};
