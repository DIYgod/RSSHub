const got = require('@/utils/got');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const parser = new Parser();

async function load(link, id) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const context = $('.comic-item-container > .meta-info-container');
    const img = context.find('img.img-comic');
    const transcript = context.find('.js-toggle-container > p');

    const title = img.attr('alt').replace('Dilbert by Scott Adams', id);
    const src = 'https:' + img.attr('src');

    const description = `<img src="${src}"></br><p>${transcript.html()}</p>`;

    return {
        title,
        description,
    };
}

module.exports = async (ctx) => {
    const title = 'Dilbert Daily Strip';
    const feed_url = 'http://feed.dilbert.com/dilbert/daily_strip';

    const feed = await parser.parseURL(feed_url);
    const items = await Promise.all(
        feed.items.slice(0, 7).map(async (item) => {
            const link = `https://dilbert.com/strip/${item.id}`;

            const single = {
                pubDate: item.pubDate,
                link,
            };

            const other = await ctx.cache.tryGet(link, () => load(link, item.id));

            return Promise.resolve(Object.assign({}, single, other));
        })
    );

    ctx.state.data = {
        title,
        link: 'https://dilbert.com',
        description: title,
        item: items,
    };
};
