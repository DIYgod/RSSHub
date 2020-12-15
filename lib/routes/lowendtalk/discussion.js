const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.lowendtalk.com';
    const currentUrl = `${rootUrl}/discussion/${ctx.params.id}`;
    let response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = cheerio.load(response.data);

    response = await got({
        method: 'get',
        url: $('.LastPage').attr('href'),
    });

    $ = cheerio.load(response.data);

    const items = $('.userContent')
        .map((_, item) => {
            item = $(item);

            const header = item.parent().parent().prev();
            const pubDate = header.find('time');

            return {
                description: item.html(),
                pubDate: pubDate.attr('datetime'),
                author: header.find('.Author').text(),
                link: `${rootUrl}${pubDate.parent().attr('href')}`,
                title: `${header.find('.Author').text().trim()}: ${item.text()}`,
            };
        })
        .get();

    ctx.state.data = {
        title: $('h1').eq(0).text(),
        link: currentUrl,
        item: items,
    };
};
