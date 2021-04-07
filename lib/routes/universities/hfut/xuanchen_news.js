const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'http://xc.hfut.edu.cn/1955/list.htm';
    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const items = $('.news')
        .map((_, e) => ({
            title: $('a', e).attr('title'),
            link: $('a', e).attr('href'),
            pubDate: $('news_meta', e).text(),
        }))
        .get();
    ctx.state.data = {
        link: baseUrl,
        title: $('title').text(),
        item: items,
    };
};
