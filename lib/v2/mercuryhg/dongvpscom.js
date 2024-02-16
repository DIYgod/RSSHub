const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `https://www.dongvps.com/`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const list = $("article.article-type-list").get ();

    const out= await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const title = $('h2 > a').text();
            const address = $('h2 > a').attr('href');
            const dateraw = $('div.type-list-date').text();

            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);
            const contents = capture('div.entry-content').html();

            const single = {
                title,
                link: address,
                description: contents,
                pubDate: parseDate(dateraw, 'YYYYÄêMMÔÂDDÈÕ'),
            };

            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'dongvps',
        link: url,
        item: out,
    };  
};
