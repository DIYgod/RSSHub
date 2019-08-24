const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const url = `https://plainlaw.me/${year}`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('article').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('h3.title > a').text();
            const address = $('h3.title > a').attr('href');
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);
            capture('div.inline-post.clearfix').remove();
            const banner = capture('div.hero').html();
            const contents = banner + capture('div.dable-content-wrapper').html();
            const single = {
                title,
                description: contents,
                link: address,
                guid: address,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '法律白話文運動',
        link: url,
        item: out,
    };
};
