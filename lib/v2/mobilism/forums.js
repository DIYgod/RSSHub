const got = require('@/utils/got');
const cheerio = require('cheerio');
const { toTitleCase } = require('@/utils/common-utils');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
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
    const response = await got(currentUrl);
    const $ = cheerio.load(cheerio.load(response.data)('tbody')[1]);
    const lists = $('tbody > tr');
    const list = lists
        .map((index, item) => {
            item = $(item);
            const title = item.find('td').first().find('a[title]').text();
            const link = new URL(item.find('td').first().find('a[title]').attr('href'), 'https://forum.mobilism.org');
            const author = item.find('td').first().find('a.username-coloured').text();
            const pubDate = item.find('td').first().find('small').text();
            link.searchParams.delete('sid');
            return {
                title,
                link: link.toString(),
                author,
                pubDate: /ago|day/.test(pubDate) ? parseRelativeDate(pubDate) : parseDate(pubDate, 'MMM D, YYYY, h:mm a'),
            };
        })
        .get()
        .sort((a, b) => b.pubDate - a.pubDate)
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 35);
    // server will return 520 if concurrency > 37 when fulltext is used
    let items;
    if (fulltext === 'y') {
        items = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got(item.link);
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
        title: `Mobilism Forums ${toTitleCase(category)} ${toTitleCase(type)} Release`,
        link: currentUrl,
        description: `Mobilism Forums ${toTitleCase(category)} ${toTitleCase(type)} RSS`,
        item: items,
    };
};
