const cheerio = require('cheerio');
const got = require('@/utils/got');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    if (!isValidHost(ctx.params.column)) {
        throw Error('Invalid column');
    }

    const url = `http://${ctx.params.column}.bio1000.com/${ctx.params.id}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.excerpt-1').get();

    const out = await Promise.all(
        list.slice(0, 5).map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('.meta').text();
            const title = $('header h2 a').attr('title');
            const partial = $('header h2 a').attr('href');
            const address = partial;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const get = cheerio.load(res.data);
            const contents = get('.article-content').html();
            const single = {
                title,
                pubDate: time,
                description: contents,
                link: address,
                guid: address,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '生物帮',
        link: url,
        item: out,
    };
};
