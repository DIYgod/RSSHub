const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'http://ss.scnu.edu.cn/tongzhigonggao/';
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.listshow li a');

    ctx.state.data = {
        title: '华南师范大学软件学院',
        link,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item
                        .contents()
                        .filter((_, node) => node.type === 'text')
                        .text(),
                    link: item.attr('href'),
                    pubDate: parseDate(item.find('.time').text()),
                };
            }),
    };
};
