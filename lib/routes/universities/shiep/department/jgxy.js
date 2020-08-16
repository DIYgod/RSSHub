const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://jgxy.shiep.edu.cn/3633/list.htm',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div[class="fields pr_fields"]');

    ctx.state.data = {
        title: '上海电力大学-经管学院-学院公告',
        link: 'https://jgxy.shiep.edu.cn/3633/list.htm',
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
