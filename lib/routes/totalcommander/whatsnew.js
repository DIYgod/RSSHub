const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const rootUrl = 'http://ghisler.com';
    const currentUrl = `${rootUrl}/whatsnew.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data.replace(/<h3 align="left">/g, '</content><content><h3 align="left">'));

    const items = $('content')
        .map((_, item) => {
            item = $(item);
            return {
                link: currentUrl,
                title: item.find('h3').text(),
                description: item.find('p').html(),
                pubDate: date(item.find('b').text().split(':')[0]),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
