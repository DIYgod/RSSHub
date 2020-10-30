const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://www.jin10.com/');
    const $ = cheerio.load(response.data);
    const item = [];
    let date;

    $('#jin_flash_list .jin-flash-item-container').each((index, ele) => {
        const year = new Date().getFullYear();
        const time = $('.item-time', ele).text();
        const title = $('.right-content div:first-of-type', ele).text();
        const link = $('.right-content .flash-item-share_right a', ele).attr('href');

        date = $('.jin-flash-date-line span', ele).text().trim() ? $('.jin-flash-date-line span', ele).text().trim() : date;

        const datetime = year + '-' + date.replace('月', '-').replace('日', ` ${time}`);

        if (title) {
            item.push({
                title,
                link,
                description: datetime,
                pubDate: new Date(datetime),
            });
        }
    });
    ctx.state.data = {
        title: '金十数据',
        link: 'https://www.jin10.com/',
        item: item,
    };
};
