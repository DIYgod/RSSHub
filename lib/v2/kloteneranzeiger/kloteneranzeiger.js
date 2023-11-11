const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.kloteneranzeiger.ch';
    const currentUrl = rootUrl; // Adjust if there's a specific page for news

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.news-list-item') // Adjust the selector based on the website's structure
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10)
        .toArray()
        .map((element) => {
            const item = $(element);

            const titleElement = item.find('h3[itemprop="headline"] a');
            const descriptionElement = item.find('.lead[itemprop="description"]');

            return {
                title: titleElement.text().trim(),
                link: new URL(item.find('h3[itemprop="headline"] a').attr('href'), rootUrl).href,
                description: descriptionElement.text().trim(),
                pubDate: parseDate(item.find('time').attr('datetime')),
            };
        });

    ctx.state.data = {
        title: 'Klotener Anzeiger News', // Change this to your preferred feed title
        link: currentUrl,
        item: items,
    };
};
