const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://yjshy.nwafu.edu.cn/tzgg/index.htm',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.sort_rightcont > ul > li');

    ctx.state.data = {
        title: '西北农林科技大学 - 研究生院公告',
        link: 'https://yjshy.nwafu.edu.cn/tzgg/index.htm',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return { title: item.find('li a').text(), description: item.find('li a').text(), pubDate: parseDate(item.find('span').text().slice(1, -1), 'YYYY/MM/DD'), link: item.find('li a').attr('href') };
                })
                .get(),
    };
};
