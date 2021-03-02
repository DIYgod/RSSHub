const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://biddingoffice.sustech.edu.cn/',
    });

    const data = response.data;

    const $ = cheerio.load(data);

    const list = $('.index-wrap.index-2 ul li');

    ctx.state.data = {
        title: '南方科技大学采购与招标管理部',
        link: 'http://biddingoffice.sustech.edu.cn/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const itemPubdate = item.find('li > span').text();
                    return {
                        pubDate: itemPubdate,
                        title: item.find('li > a').text(),
                        description: item.find('li > a').text(),
                        link: item.find('li > a').attr('href'),
                    };
                })
                .get(),
    };
};
