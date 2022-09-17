const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.xyplorer.com';
    const currentUrl = `${rootUrl}/whatsnew.php`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.waznu')
        .map((_, item) => {
            item = $(item);
            return {
                link: currentUrl,
                description: `<ul>${item.html()}</ul>`,
                title: item.prev().prev().text(),
                pubDate: date(item.prev().text().replace('released ', '')),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
