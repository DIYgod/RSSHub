const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url').resolve;

const host = 'http://jw.cqust.edu.cn';
const map = {
    notify: '/tzgg/tz.htm',
    news: '/xwdt/xxyw.htm',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'notify';
    const link = host + map[type];
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('li[id^="lineu"]').slice(0, 10);

    ctx.state.data = {
        title: '重科教务处',
        link: link,
        description: $('meta[name="description"]').attr('content') || '重科教务处',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        description: item.find('p').text() + ' [...]',
                        pubDate: new Date(item.find('.shijian').text().replace('》', '')).toUTCString(),
                        link: url(host, item.find('a').attr('href')),
                    };
                })
                .get(),
    };
};
