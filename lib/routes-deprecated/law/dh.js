const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.dehenglaw.com/CN/paper/0008/000902.aspx';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('div.news_box h2').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').html();
            const itemUrl = $('a').attr('href');

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                link: itemUrl,
                description: $d('.news_content_box').html(),
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
