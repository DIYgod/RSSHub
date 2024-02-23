const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = 'https://www.howtoforge.com';
    const response = await got(`${currentUrl}/feed.rss`);
    const $ = cheerio.load(response.data, { xmlMode: true });
    const title_main = $('channel > title').text();
    const description_main = $('channel > description').text();
    const items = $('channel > item')
        .map((_, item) => {
            const $item = $(item);
            const link = $item.find('link').text();
            const title = $item.find('title').text();
            const description = $item.find('description').text();
            const pubDate = $item.find('pubDate').text();
            return {
                link,
                pubDate, // no need to normalize because it's from a valid RSS feed
                title,
                description,
            };
        })
        .get();

    ctx.state.data = {
        title: title_main,
        description: description_main,
        link: currentUrl,
        item: items,
    };
};
