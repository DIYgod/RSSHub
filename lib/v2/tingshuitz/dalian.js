const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url =
        'https://swj.dl.gov.cn/module/web/jpage/dataproxy.jsp?page=1&webid=28&path=https://swj.dl.gov.cn/&columnid=4296&unitid=31227&webname=%25E5%25A4%25A7%25E8%25BF%259E%25E5%25B8%2582%25E6%25B0%25B4%25E5%258A%25A1%25E5%25B1%2580&permissiontype=0';
    const response = await got(url);

    const $ = cheerio.load(response.data);
    const items = $('recordset record')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text().trim(),
                description: `大连市停水通知：${item.find('a').text().trim()}`,
                pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
                link: item.find('a').attr('href'),
            };
        });

    ctx.state.data = {
        title: '停水通知 - 大连市水务局',
        link: 'https://swj.dl.gov.cn/col/col4296/index.html',
        description: '停水通知 - 大连市水务局',
        item: items,
    };
};
