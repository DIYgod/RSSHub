const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://jjxy.shiep.edu.cn/2582/list.htm',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div[class="fields pr_fields"]');

    ctx.state.data = {
        title: '上海电力大学-继续教育学院-通知公告',
        link: 'https://jjxy.shiep.edu.cn/2582/list.htm',
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
