const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://nautil.us/term/f/${ctx.params.tid}`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('article.search-result').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('h3 > a').text();
            const partial = $('h3 > a').attr('href');
            const address = `http://nautil.us${partial}`;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);
            capture('div.reco').remove();
            const banner = capture('div.banner').html();
            const textWithTime = capture('div.byline').text();
            const author = capture('div.byline > span:nth-child(2)').text();
            const contents = banner + capture('div.page-content').html();
            const single = {
                title,
                author: author,
                description: contents,
                link: address,
                guid: address,
                pubDate: new Date(textWithTime).toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'Nautilus | ' + $('title').text(),
        link: url,
        item: out,
    };
};
