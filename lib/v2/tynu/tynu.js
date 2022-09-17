const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'http://www.tynu.edu.cn';

module.exports = async (ctx) => {
    const link = `${baseUrl}/index/tzgg.htm`;
    const response = await got(link);
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.news_content_list')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                link: new URL(item.find($('a')).attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.content_list_time').text(), 'YYYYMM-DD'),
            };
        });

    await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                item.description = $('#vsb_content').html() + ($('.content ul').not('.btm-cate').html() || '');
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '太原师范学院通知公告',
        link,
        item: list,
    };
};
