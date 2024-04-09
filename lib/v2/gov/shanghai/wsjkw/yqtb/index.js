const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = `https://wsjkw.sh.gov.cn/yqtb/index.html`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.uli16.nowrapli.list-date  li');
    ctx.state.data = {
        title: '疫情通报-上海卫健委',
        link: url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const title = item.find('a').text();
                    const address = item.find('a').attr('href');
                    const host = `https://wsjkw.sh.gov.cn`;
                    const pubDate = parseDate(item.find('span').text(), 'YYYY-MM-DD');
                    return {
                        title,
                        description: title,
                        pubDate,
                        link: host + address,
                        guid: host + address,
                    };
                })
                .get(),
    };
};
