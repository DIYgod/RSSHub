const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const index_url = 'https://ctt.swjtu.edu.cn/xwdt.htm';
    const response = await got({
        method: 'get',
        url: index_url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div.news_item');

    ctx.state.data = {
        title: $('title').text(),
        link: index_url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const link = url.resolve(index_url, item.find('a').eq(1).attr('href'));
                    return {
                        title: item.children('div.news_item_title').text(),
                        description: `<a href="${link}">网页链接</a>`,
                        link: link,
                        pubDate: new Date(item.children('div.news_item_time').text()),
                    };
                })
                .get(),
    };
};
