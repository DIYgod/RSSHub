const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.princessconnect.so-net.tw/news',
    });

    const data = response.data;

    const $ = cheerio.load(data);

    let newslist = $('main > article > dl > dd > a').map((index, item) => {
        item = $(item);
        let link = 'http://www.princessconnect.so-net.tw' + item.attr('href');
        let title = item.text();
        return {
            title: title,
            link: link,
            id: link,
            summary: title
        };
    });

    ctx.state.data = {
        title: '公主连接台服官网新闻',
        link: 'http://www.princessconnect.so-net.tw/news',
        item: newslist,
    };
};
