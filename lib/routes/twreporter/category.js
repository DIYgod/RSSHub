const cheerio = require('cheerio');
const got = require('@/utils/got');

const fetch = require('./fetch_article');

module.exports = async (ctx) => {
    const baseURL = 'https://www.twreporter.org';
    const url = baseURL + `/categories/${ctx.params.cid}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.lnKPLr').get();
    const category = $('.kCfkTU').text();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const address = baseURL + $('a').attr('href');
            const title = $('.list-item__Title-sc-1dx5lew-5').text();
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
        title: `報導者 | ${category}`,
        link: url,
        item: out,
    };
};
