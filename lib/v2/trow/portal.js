const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://trow.cc`,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#portal_content .borderwrap[style="display:show"]');

    ctx.state.data = {
        title: `The Ring of Wonder - Portal`,
        link: `https://trow.cc`,
        description: `The Ring of Wonder 首页更新`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const dateraw = item.find('.postdetails').text();
                    return {
                        title: item.find('.maintitle p:nth-child(2) > a').text(),
                        description: item.find('.portal_news_content .row18').html(),
                        link: item.find('.maintitle p:nth-child(2) > a').attr('href'),
                        author: item.find('.postdetails a').text(),
                        pubDate: timezone(parseDate(dateraw.slice(3), 'YYYY-MM-DD, HH:mm'), +8),
                    };
                })
                .get(),
    };
};
