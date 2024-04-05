const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url').resolve;

const host = 'http://tingshen.court.gov.cn/preview';

module.exports = async (ctx) => {
    const response = await got.get(host);
    const $ = cheerio.load(response.data);
    const list = $('ul[class="_preview_ul"]').find('li');
    ctx.state.data = {
        title: '中国庭审公开',
        link: host,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a[class="ellipsis22"]').text(),
                        description: '开庭法院：' + item.find('span[class="show-col show-court-name"]').find('a[target="_blank"]').text() + '\n时间：' + item.find('span[class="show-col show-time"]').text(),
                        pubDate: new Date(item.find('span[class="pull-right nes-date"]').text()).toUTCString(),
                        link: url(host, item.find('a[class="ellipsis22"]').attr('href')),
                    };
                })
                .get(),
    };
};
