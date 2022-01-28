const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const utils = require('./utils');
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
module.exports = async (ctx) => {
    const { category, type } = ctx.params;
    const currentUrl = rootUrl + categeoryMap[category][type];
    const response = await got.get(currentUrl);
    const $ = cheerio.load(cheerio.load(response.data)('tbody')[1]);
    const list = $('tbody > tr');

    const items = list
        .map((index, item) => {
            item = $(item);
            const title = item.find('td').first().find('a[title]').text();
            const link = new URL(item.find('td').first().find('a[title]').attr('href'), 'https://forum.mobilism.org');
            const date = item.find('td').first().find('small').text();
            const author = item.find('td').first().find('a.username-coloured').text();
            const pubDate = timezone(utils.parseDate(date), 0);
            return {
                title,
                pubDate,
                link,
                author,
            };
        })
        .get();

    ctx.state.data = {
        title: `Mobilism Forums ${utils.firstUpperCase(category)} ${utils.firstUpperCase(type)} Release`,
        link: currentUrl,
        description: `Mobilism Forums ${utils.firstUpperCase(category)} ${utils.firstUpperCase(type)} RSS`,
        item: items,
    };
};
