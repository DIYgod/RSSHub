const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://www.jin10.com/');
    const $ = cheerio.load(response.data);
    const item = [];
    let month_day;

    $('#jin_flash_list .jin-flash-item-container').each((index, ele) => {
        const year = new Date().getFullYear();
        const new_month_day = $('.jin-flash-date-line span', ele).text().trim();
        new_month_day && (month_day = new_month_day);
        const month = month_day.match(/\d+/g)[0];
        const day = month_day.match(/\d+/g)[1];
        const time = $('.item-time', ele).text();
        const date = new Date(`${year}-${month}-${day} ${time}`);

        item.push({
            title: $('.right-content div:first-of-type', ele).text(),
            link: $('.right-content .flash-item-share_right a', ele).attr('href'),
            description: `${year}-${month}-${day} ${time}`,
            pubDate: date.toUTCString(),
        });
    });
    ctx.state.data = {
        title: '金十数据',
        link: 'https://www.jin10.com/',
        item: item,
    };
};
