const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await got({
        method: 'get',
        url: 'https://lib.scnu.edu.cn/news/zuixingonggao',
        headers: {
            Referer: 'https://lib.scnu.edu.cn',
        },
    });
    const $ = cheerio.load(res.data);
    const list = $('.article-list').find('li').slice(0, 10);

    ctx.state.data = {
        title: $('title').text(),
        link: 'https://lib.scnu.edu.cn/news/zuixingonggao',
        description: '华南师范大学图书馆 - 通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        pubDate: new Date(item.find('.clock').text()).toUTCString(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
