const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url').resolve;

const typelist = ['最新', '行政', '人事', '科研', '讲座', '本科生', '研究生', '学工'];

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type) || 0;
    const link = 'http://aia.hust.edu.cn/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.m_content .m_con').eq(type).find('.N02_list_dl').slice(0, 10);

    ctx.state.data = {
        title: `华科人工智能和自动化学院${typelist[type]}通知`,
        link: link,
        description: `华科人工智能和自动化学院${typelist[type]}通知`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const day = item.find('.N02_list_Icon i').text();
                    item.find('.N02_list_Icon').find('i').remove();
                    const year_month = item.find('.N02_list_Icon').text();
                    return {
                        title: item.find('h4 a').text(),
                        description: item.find('dd p').text() || `华科人工智能和自动化学院${typelist[type]}通知`,
                        pubDate: new Date(year_month + ' ' + day).toUTCString(),
                        link: url(link, item.find('h4 a').attr('href')),
                    };
                })
                .get(),
    };
};
