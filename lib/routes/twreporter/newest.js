const cheerio = require('cheerio');
const got = require('@/utils/got');

const fetch = require('./fetch_article');

module.exports = async (ctx) => {
    const url = 'https://www.twreporter.org';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.gKMjSz').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const address = url + $('a').attr('href');
            const title = $('.dpNivU').text();
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = await fetch(address);
            single.title = title;

            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `報導者 | 最新`,
        link: url,
        item: out,
    };
};
