const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const data = await got.get(`https://www.independent.co.uk/extras/indybest/gadgets-tech/video-games-consoles/ps5-stock-uk-restock-live-today-b1938965.html`);
    const $ = cheerio.load(data.data);

    const list = $('div[items]>div');

    ctx.state.data = {
        title: `PS5 stock UK - The Independent`,
        link: `https://www.independent.co.uk/extras/indybest/gadgets-tech/video-games-consoles/ps5-stock-uk-restock-live-today-b1938965.html`,
        item: list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('h3').text(),
                    description: item.find('>div').eq(0).html(),
                    link: item.find('a').eq(0).attr('href'),
                    pubDate: parseInt(item.attr('data-sort-time')),
                    author: item.find('>div').eq(1).find('span').eq(0).html(),
                };
            })
            .get()
            .reverse(),
    };
};
