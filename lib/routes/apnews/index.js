const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got.get('https://apnews.com/');
    const $ = cheerio.load(response.data);
    const list = [];

    // main story component
    const main = $('div[data-key=main-story]').first();

    // headline news
    const headline = {};
    headline.title = $(main).find('a[data-key=card-headline] h1').first().text();
    headline.link = 'https://apnews.com' + $(main).find('a[data-key=card-headline]').first().attr('href');
    list.push(headline);

    // related stories
    $(main)
        .find('a[data-key=related-story-link]')
        .each(function (_, e) {
            const item = {};
            item.title = $(e).find('div[data-key=related-story-headline]').first().text();
            item.link = 'https://apnews.com' + $(e).attr('href');
            list.push(item);
        });

    const result = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const content = await got.get(item.link);

                    const description = cheerio.load(content.data);
                    const metadata = JSON.parse(description('script[type="application/ld+json"]').html());
                    const featureImageURL = metadata.image;

                    item.description = `<img src="${featureImageURL}">`;
                    item.description += description('div[class=Article]')
                        .html()
                        .replace(/ADVERTISEMENT/g, '');
                    item.pubDate = new Date(metadata.datePublished).toISOString();
                    item.author = metadata.author[0];
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: 'Associated Press News',
        link: 'https://apnews.com/',
        item: result,
    };
};
