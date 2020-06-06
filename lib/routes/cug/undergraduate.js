const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    // 发起 HTTP GET 请求

    const baseUrl = 'http://www.cug.edu.cn/index/tzgg.htm';

    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#container > div > div > div.col-news > div.col-news-con > ul > li');

    ctx.state.data = {
        title: '中国地质大学(武汉) - 综合通知公告',
        link: baseUrl,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const _link = item.find('a').attr('href');
                    return {
                        title: item.find('a').text(),
                        link: _link,
                        pubDate: new Date(item.find('span').text().replace('年', '-').replace('月', '-').replace('日', '')).toUTCString(),
                    };
                })
                .get(),
    };
};
