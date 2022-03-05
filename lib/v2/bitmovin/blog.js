const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://bitmovin.com/blog/';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('div.blog-posts article')
        .slice()
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('h2 a').text(),
                author: item.find('li.post-author span a').text(),
                description: item.find('div.entry p').text(),
                pubDate: parseDate(item.find('li.post-date').text()),
                link: item.find('h2 a').attr('href'),
            };
        })
        .get();

    ctx.state.data = {
        title: 'Blog - Bitmovin',
        link: rootUrl,
        item: items,
    };
};
