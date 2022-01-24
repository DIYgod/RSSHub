const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://wsjkw.sh.gov.cn/yqtb/index.html`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.uli16.nowrapli.list-date  a');
    ctx.state.data = {
        title: '疫情通报-上海卫健委',
        link: url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const title = item.text();
                    const address = item.attr('href');
                    const host = `http://wsjkw.sh.gov.cn`;
                    return {
                        title,
                        description: title,
                        link: host + address,
                        guid: host + address,
                    };
                })
                .get(),
    };
};
