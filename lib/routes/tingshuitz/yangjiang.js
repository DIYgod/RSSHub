const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const url = 'http://www.yjsswjt.com/zxdt_list.jsp?flbz=7';
    const response = await got.get(url, {
        responseType: 'buffer',
    });

    const data = response.data;
    const $ = cheerio.load(iconv.decode(data, 'gb2312'));
    const list = $('div.list_ul_div > ul > li');

    ctx.state.data = {
        title: '停水通知 - 阳江市水务集团有限公司',
        link: 'http://www.yjsswjt.com/zxdt_list.jsp?flbz=7',
        item: list
            .map((_, el) => {
                const item = $(el);

                const id = item.find('a').attr('href').slice(17, -1);
                return {
                    title: item.find('span').text().trim(),
                    description: item.find('span').text().trim(),
                    link: 'http://www.yjsswjt.com/list.jsp?id=' + id,
                };
            })
            .get(),
    };
};
