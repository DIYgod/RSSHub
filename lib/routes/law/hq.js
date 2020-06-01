const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.glo.com.cn/news/publications_list13.html';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('ul.ul-list li').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').attr('title');
            const itemUrl = $('a').attr('href');

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                link: itemUrl,
                description: $d('article').html(),
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
