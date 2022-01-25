const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = `https://forum.mobilism.org/viewforum.php?f=`;
const categeoryMap = {
    books: {
        romance: 1292,
        scifi: 1293,
        classics: 121,
        magazines: 123,
        audioBooks: 124,
        comics: 311,
    },
    android: {
        apps: 399,
        games: 408,
    },
    iphone: {
        apps: 316,
        games: 320,
    },
    ipad: {
        apps: 951,
        games: 988,
    },
};

function firstUpperCase(str) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

module.exports = async (ctx) => {
    const { category, type } = ctx.params;
    const currentUrl = rootUrl + categeoryMap[category][type];
    const response = await got.get(currentUrl);
    const $ = cheerio.load(cheerio.load(response.data)('div#page-body > main > table')[1]);
    const list = $('tbody > tr');
    const items = list
        .map((index, item) => {
            item = $(item);
            const title = item.find('td').first().find('a[title]').text();
            const link = new URL(item.find('td').first().find('a[title]').attr('href'), 'https://forum.mobilism.org');
            let date = item.find('td').first().find('small').text() + '';
            if (date.indexOf('minutes') !== -1) {
                date = new dayjs();
                date = date.subtract(item.find('td').first().find('small').text().replace(' minutes ago', ''), 'm');
            } else if (date.indexOf('Yesterday') !== -1) {
                date = new dayjs();
                date.subtract(1, 'd');
            } else if (date.indexOf('Today') !== -1) {
                const _date = date.replace('Today, ', '');
                date = new dayjs();
                date.set('h', _date.split(':')[0]);
                date.set('m', _date.split(':')[1]);
            }
            const pubDate = parseDate(date, 'MMM Do, YYYY, h:mm a');
            return {
                title,
                pubDate,
                link,
            };
        })
        .get();
    ctx.state.data = {
        title: `Mobilism ${firstUpperCase(category)} ${firstUpperCase(type)} Release`,
        link: currentUrl,
        description: `Mobilism ${firstUpperCase(category)} ${firstUpperCase(type)} 订阅信息`,
        item: items,
    };
};
