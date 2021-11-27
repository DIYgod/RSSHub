const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    // const area = ctx.params.area;
    const url = 'http://www.swj.dl.gov.cn/html/tstz/';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.listBox li');

    ctx.state.data = {
        title: $('title').text() || '停水通知 - 大连市水务局',
        link: 'http://www.swj.dl.gov.cn/html/tstz/',
        description: $('meta[name="description"]').attr('content') || $('title').text() || '停水通知 - 大连市水务局',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        description: `大连市停水通知：${item.find('a').text()}`,
                        pubDate: new Date(item.find('span').text()).toUTCString(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
