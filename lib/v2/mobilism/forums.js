const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const dayjs = require('dayjs');
const timezone = require('@/utils/timezone');
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
    const { category, type, fulltext } = ctx.params;
    const currentUrl = rootUrl + categeoryMap[category][type];
    const response = await got.get(currentUrl, {
        headers: {
            cookie: await utils.login(),
        },
    });
    const $ = cheerio.load(cheerio.load(response.data)('tbody')[1]);
    const lists = $('tbody > tr');
    const list = lists
        .map((index, item) => {
            item = $(item);
            const title = item.find('td').first().find('a[title]').text();
            const link = new URL(item.find('td').first().find('a[title]').attr('href'), 'https://forum.mobilism.org').toString();
            const author = item.find('td').first().find('a.username-coloured').text();
            const pubDate = timezone(dayjs(item.find('td').first().find('small').text(), 'DD MMM YYYY, HH:mm').toDate(), 0);
            return {
                title,
                link,
                author,
                pubDate,
            };
        })
        .get();
    let items;
    if (fulltext === 'y') {
        items = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got.get(item.link);
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('div.content').html();
                    return item;
                })
            )
        );
    } else {
        items = list;
    }

    ctx.state.data = {
        title: `Mobilism Forums ${utils.firstUpperCase(category)} ${utils.firstUpperCase(type)} Release`,
        link: currentUrl,
        description: `Mobilism Forums ${utils.firstUpperCase(category)} ${utils.firstUpperCase(type)} RSS`,
        item: items,
    };
};
