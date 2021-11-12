const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://www.xwlb.net.cn/video.html`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.post_body').get();

    const out = await Promise.all(
        list.slice(0, 2).map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('h2 a').attr('title');
            const partial = $('h2 a').attr('href');
            const address = partial;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const get = cheerio.load(res.data);

            const contents = get('.content').html();
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
        title: $('title').text(),
        link: url,
        item: out,
    };
};
