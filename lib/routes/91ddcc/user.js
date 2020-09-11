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
            const detailTitle = item.find('p.detail-title').text();

            let link = currentUrl;
            let title = detailTitle || word.html();

            if (word.attr('onclick')) {
                link = `https://sns.91ddcc.com${word.attr('onclick').split("'")[1]}`;
            } else {
                title = item.find('div.fl').text().trim();
            }

            item.find('p.detail-title').remove();

            return {
                title: title,
                link: link,
                description: item.find('div.dynamic-content').html(),
                pubDate: new Date(item.attr('add-time') * 1000).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: `${$('span.user-name').text()} - 才符`,
        link: currentUrl,
        item: list,
    };
};
