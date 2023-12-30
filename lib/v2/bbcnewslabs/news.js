const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://bbcnewslabs.co.uk';
    const response = await got({
        method: 'get',
        url: `${rootUrl}/news`,
    });

    const $ = cheerio.load(response.data);

    const items = $('a[href^="/news/20"]')
        .slice()
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('h3[class^="thumbnail-module--thumbnailTitle--"]').text(),
                description: item.find('span[class^="thumbnail-module--thumbnailDescription--"]').text(),
                pubDate: parseDate(item.find('span[class^="thumbnail-module--thumbnailType--"]').text()),
                link: rootUrl + item.attr('href'),
            };
        })
        .get();

    ctx.state.data = {
        title: 'News - BBC News Labs',
        link: rootUrl,
        item: items,
    };
};
