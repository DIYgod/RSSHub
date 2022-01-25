const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = `https://forum.mobilism.org/viewforum.php?f=`;
const categeoryMap = {
    books: {
        romance: 1292,
        scifi: 1293,
        classics: 121,
        magazines: 123,
        audioBooks: 124,
        comics: 311
    },
    android: {
        apps: 399,
        games: 408
    },
    iphone: {
        apps: 316,
        games: 320
    },
    ipad: {
        apps: 951,
        games: 988
    }
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
    const items = await Promise.all(list.map(async (index, item) => {
        item = $(item);
        const title = item.find('td').first().find('a[title]').text();
        const link = new URL(item.find('td').first().find('a[title]').attr('href'), 'https://forum.mobilism.org');
        // const date = item.find('td').first().find('small').text();
        // const res = await await got.get(link);
        // const content = cheerio.load(res.data);
        // const description = content('div.content').html();
        return {
            title,
            // description: description,
            link
        };
    }));
    ctx.state.data = {
        title: `Mobilism ${firstUpperCase(category)} ${firstUpperCase(type)} Release`,
        link: currentUrl,
        description: `Mobilism ${firstUpperCase(category)} ${firstUpperCase(type)} 订阅信息`,
        item: items,
    };
};
