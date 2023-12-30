const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    // const area = ctx.params.area;
    const url = 'http://www.hzwgc.com/public/stop_the_water/';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.datalist li');

    ctx.state.data = {
        title: $('title').text(),
        link: 'http://www.hzwgc.com/public/stop_the_water/',
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.title').text(),
                        description: `杭州市停水通知：${item.find('.title').text()}`,
                        pubDate: new Date(item.find('.published').text()).toUTCString(),
                        link: `http://www.hzwgc.com${item.find('.btn-read').attr('href')}`,
                    };
                })
                .get(),
    };
};
