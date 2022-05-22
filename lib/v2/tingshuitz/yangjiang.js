const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = 'https://www.yjsswjt.com/zxdt_list.jsp?flbz=7';
    const response = await got(url);

    const $ = cheerio.load(response.data);
    const list = $('div.list_ul_div > ul > li');

    ctx.state.data = {
        title: '停水通知 - 阳江市水务集团有限公司',
        link: 'https://www.yjsswjt.com/zxdt_list.jsp?flbz=7',
        item: list
            .map((_, el) => {
                const item = $(el);

                const id = item.find('a').attr('href').slice(17, -1);
                return {
                    title: item.find('span').text().trim(),
                    description: item.find('span').text().trim(),
                    link: 'http://www.yjsswjt.com/list.jsp?id=' + id,
                    pubDate: parseDate(item.find('.datetime').text(), 'YYYY.MM.DD'),
                };
            })
            .get(),
    };
};
