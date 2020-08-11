const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://sns.91ddcc.com/${ctx.params.user}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.dynamic-single')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const word = item.find('div.word');
            return {
                title: item.find('div.detail-time').text(),
                link: `https://sns.91ddcc.com/${item.attr('id').split('-')[1]}`,
                description: word.html(),
                pubDate: new Date(item.find('div.detail-time').text() + ' GMT+8').toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: `${$('span.user-name').text()} - 才符`,
        link: currentUrl,
        item: list,
    };
};
