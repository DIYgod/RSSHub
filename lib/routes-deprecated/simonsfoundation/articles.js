const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.simonsfoundation.org/news/articles`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.news-links-wrapper').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a.news-title').text();
            const address = $('a.news-title').attr('href');
            const time = $('.news-date').text();

            const cache = await ctx.cache.get(address);
            if (cache) {
                return JSON.parse(cache);
            }

            const res = await got.get(address);
            const capture = cheerio.load(res.data);
            const banner = capture('div.o-page-header__hero').html();
            const author = capture('.m-meta__inherit').text();
            capture('.m-block-info__animation').remove();
            capture('.o-blocks__left').remove();
            capture('.m-tags').remove();
            const contents = banner === null ? capture('.o-blocks').html() : banner + capture('.o-blocks').html();
            const single = {
                title,
                author,
                description: contents,
                link: address,
                guid: address,
                pubDate: new Date(time).toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: 'Simons Foundation | Articles',
        link: url,
        item: out,
    };
};
