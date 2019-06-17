const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.a9vg.com/list/news',
        headers: {
            Referer: 'http://www.a9vg.com/list/news',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.a9-rich-card-list li');

    ctx.state.data = {
        title: 'A9VG电玩部落',
        link: 'http://www.a9vg.com/list/news/',
        description: '电玩资讯_电玩动态- A9VG电玩部落',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.a9-rich-card-list_label').text(),
                        description: item.find('.a9-rich-card-list_summary').text() + '<img src="' + item.find('img').attr('src') + '">',
                        pubDate: new Date(item.find('.a9-rich-card-list_infos').text()).toUTCString(),
                        link: 'http://www.a9vg.com' + item.find('.a9-rich-card-list_item').attr('href'),
                    };
                })
                .get(),
    };
};
