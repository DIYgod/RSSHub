const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.tongshang.com/researches';
    const ori_url = 'http://www.tongshang.com';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.tableList .newsTab').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').html();
            const sub_url = $('a').attr('href');
            const itemUrl = ori_url + sub_url;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                link: itemUrl,
                description: $d('.col-md-9').html(),
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
