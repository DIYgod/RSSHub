const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const response = await got.get('https://www.jin10.com/');
    const $ = cheerio.load(response.data);
    let date;

    const item = $('#jin_flash_list .jin-flash-item-container')
        .filter((index, ele) => !!$('.right-content div:first-of-type', ele).text() && !$('.is-vip', ele).length)
        .map((index, ele) => {
            const year = new Date().getFullYear();
            const time = $('.item-time', ele).text();
            const title = $('.right-content div:first-of-type', ele).text();
            const link = $('.right-content .flash-item-share_right a', ele).attr('href');

            date = $('.jin-flash-date-line span', ele).text().trim() ? $('.jin-flash-date-line span', ele).text().trim() : date;

            const datetime = year + '-' + date.replace('月', '-').replace('日', ` ${time}`);

            return {
                title,
                link,
                description: datetime,
                pubDate: timezone(parseDate(datetime), 8),
            };
        })
        .get();

    ctx.state.data = {
        title: '金十数据',
        link: 'https://www.jin10.com/',
        item,
    };
};
