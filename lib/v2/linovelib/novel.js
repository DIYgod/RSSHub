const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got(`https://www.linovelib.com/novel/${ctx.params.id}/catalog`);
    const $ = cheerio.load(response.data);

    const meta = $('.book-meta');
    const title = meta.children().first().text();
    const author = meta.find('p > span > a').text();

    const list = $('.chapter-list');
    const items = list
        .find('li')
        .find('a')
        .filter((idx, item) => $(item).attr('href').startsWith('/novel/'))
        .map((idx, item) => ({
            title: $(item).text(),
            author,
            description: $(item).text(),
            link: `https://www.linovelib.com${$(item).attr('href')}`,
        }))
        .get();
    items.reverse();

    ctx.state.data = {
        title: `哩哔轻小说 - ${title}`,
        link: `https://www.linovelib.com/novel/${ctx.params.id}/catalog`,
        description: title,
        language: 'zh',
        item: items,
    };
};
