const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.whwater.com/gsfw/tstz/';
    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.z4');

    ctx.state.data = {
        title: $('title').text() || '停水通知 - 武汉市水务集团有限公司',
        link: 'https://www.whwater.com/gsfw/tstz/',
        description: $('meta[name="description"]').attr('content') || $('title').text() || '停水通知 - 武汉市水务集团有限公司',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        description: `武汉市停水通知：${item.find('a').text()}`,
                        pubDate: new Date(item.find('span').text()).toUTCString(),
                        link: url.resolve(baseUrl, item.find('a').attr('href')),
                    };
                })
                .get(),
    };
};
