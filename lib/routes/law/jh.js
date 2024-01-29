const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.junhe.com/legal-updates';
    const ori_url = 'http://www.junhe.com';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.news-content ul.list').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('h1').html();
            const sub_url = $('a').attr('href');
            const itemUrl = ori_url + sub_url;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                link: itemUrl,
                description: $d('.d-content').html(),
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
