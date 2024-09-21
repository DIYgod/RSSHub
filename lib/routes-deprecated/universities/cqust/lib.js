const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url').resolve;

const host = 'http://lib.cqust.edu.cn';
const map = {
    news: '/node/410.jspx',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'news';
    const link = host + map[type];
    const response = await got.get(link, {
        headers: {
            Cookie: 'JSESSIONID=' + Math.random(),
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('div[class="newsList"]').find('li').slice(0, 10);

    ctx.state.data = {
        title: '重科图书馆',
        link,
        description: $('meta[name="description"]').attr('content') || '重科图书馆公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        description: '重科图书馆公告',
                        pubDate: new Date(item.find('span[class="time"]').text()).toUTCString(),
                        link: url(host, item.find('a').attr('href')),
                    };
                })
                .get(),
    };
};
