const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
module.exports = async (ctx) => {
    const response = await got('https://polkadot.network/blog');

    const $ = cheerio.load(response.data);
    const list = $('.container .row .card > div > a:nth-child(2)');
    const items = await Promise.all(
        list
            .map((_, originItem) => {
                const item = {
                    title: $(originItem).find('h5').text().trim(),
                    link: 'https://polkadot.network' + $(originItem).attr('href'),
                };
                return ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got(item.link);
                    const content = cheerio.load(detailResponse.data);
                    const meta = JSON.parse(content('script[type="application/ld+json"]').text());
                    item.author = meta.author.name;
                    item.description = content('main .container').eq(1).html();
                    item.pubDate = parseDate(meta.datePublished);
                    return item;
                });
            })
            .get()
    );
    ctx.state.data = {
        title: $('head title').text(),
        link: 'https://polkadot.network/blog/',
        image: $('link[rel=icon]').attr('href'),
        item: items,
    };
};
