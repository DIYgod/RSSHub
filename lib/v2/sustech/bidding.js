const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'http://biddingoffice.sustech.edu.cn';
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = cheerio.load(data);

    const list = $('.index-wrap.index-2 ul li');

    ctx.state.data = {
        title: '南方科技大学采购与招标管理部',
        link,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const itemPubdate = item.find('li > span').text();
                const a = item.find('li > a');
                return {
                    pubDate: parseDate(itemPubdate, 'YYYY-MM-DD'),
                    title: a.text(),
                    link: a.attr('href'),
                };
            }),
    };
};
