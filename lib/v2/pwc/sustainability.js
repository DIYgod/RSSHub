const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.strategyand.pwc.com/at/en/functions/sustainability-strategy/publications.html';

    const { data: response } = await got.get(baseUrl);
    const $ = cheerio.load(response);

    const list = $('article')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const div = item.find('div.collection-item__content').first();

            const link = a.attr('href');
            const title = div.find('h4').find('span').text();
            const description = div.find('p').text();

            return {
                title,
                link,
                description,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got.get(item.link);
                const $ = cheerio.load(data);

                const pubDate = parseDate($('div.hero-card__secondary').find('li').second().text());
                const author = $('div.summary-text').find('p').first().text();

                item.pubDate = pubDate;
                item.author = author;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'PwC Strategy& - Sustainability Publications',
        link: baseUrl,
        item: items,
    };
};
