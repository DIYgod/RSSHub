const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://newshub.sustech.edu.cn';
    const link = `${baseUrl}/news`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = cheerio.load(data);

    const list = $('.m-newslist ul li');

    ctx.state.data = {
        title: '南方科技大学新闻网-中文',
        link,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const itemPicUrl = item
                    .find('.u-pic div')
                    .attr('style')
                    .match(/url\('(.+?)'\)/)[1];
                const itemPubdate = item.find('.mobi').text();
                return {
                    pubDate: parseDate(itemPubdate, 'YYYY-MM-DD'),
                    title: item.find('.f-clamp').text(),
                    description: `<img src="${baseUrl}${itemPicUrl}"><br>${item.find('.f-clamp4').text()}`,
                    link: `${baseUrl}${item.find('a').attr('href')}`,
                };
            }),
    };
};
