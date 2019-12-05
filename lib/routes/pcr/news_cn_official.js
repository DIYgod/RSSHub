const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://game.bilibili.com/pcr/yuyue/news.html',
    });

    const data = response.data;

    const $ = cheerio.load(data);

    let newslist = $('div.news-list > a.news-item').map((index, item) => {
        item = $(item);
        let link = 'https://game.bilibili.com/pcr/yuyue/news.html' + item.attr('href')
        let title = item.find('span.text.nititle').text();
        return {
            title: title,
            link: link,
            id: link,
            summary: title
        };
    });

    ctx.state.data = {
        title: '公主连接国服官网新闻',
        link: 'https://game.bilibili.com/pcr/yuyue/news.html',
        item: newslist,
    };
};
