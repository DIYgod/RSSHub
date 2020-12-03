const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const os = ctx.params.os || 'mac';

    const rootUrl = 'https://www.rescuetime.com/release-notes';
    const currentUrl = `${rootUrl}/${os}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data.replace(/<h3 align="left">/g, '</content><content><h3 align="left">'));

    const items = $('.release')
        .map((_, item) => {
            item = $(item);
            return {
                link: currentUrl,
                title: item.find('h2').text(),
                description: item.find('p').html(),
                pubDate: new Date(
                    item
                        .find('h2')
                        .text()
                        .match(/(\d{4}\/\d{2}\/\d{2})/)[1]
                ),
            };
        })
        .get();

    ctx.state.data = {
        title: $('h1').text(),
        link: currentUrl,
        item: items,
    };
};
