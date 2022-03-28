const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://wiki.ioin.in/';
    const response = await got.get(String(url));
    const $ = cheerio.load(response.data);
    const list = $('table>tbody>tr').get();
    const items = list.map((i) => {
        const item = $(i);
        const title = item.find('td:nth-child(2) a').text();
        const pla = item.find('.vul-type-item').text().replace(/\s+/g, '');
        const date = new Date(item.find('td:first-child').text().replace(/\s+/g, '')).toUTCString();
        const href = item.find('td:nth-child(2) a').attr('href');
        return {
            title: `${title} ${pla !== '未知' ? pla : ''}`,
            pubDate: date,
            link: `${url}${href}`,
        };
    });

    ctx.state.data = {
        title: 'sec-news',
        link: 'http://wiki.ioin.in/',
        item: items,
    };
};
