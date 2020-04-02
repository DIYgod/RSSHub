const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await got({
        method: 'get',
        url: 'https://jw.scnu.edu.cn/ann/index.html',
        headers: {
            Referer: 'https://jw.scnu.edu.cn',
        },
    });
    const $ = cheerio.load(res.data);
    const list = $('.notice_01').find('li').slice(0, 10);

    ctx.state.data = {
        title: $('title').first().text(),
        link: 'https://jw.scnu.edu.cn/ann/index.html',
        description: '华南师范大学教务处 - 通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        pubDate: new Date(item.find('.time').text()).toUTCString(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
