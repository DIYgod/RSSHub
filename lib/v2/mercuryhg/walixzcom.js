const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');


module.exports = async (ctx) => {
    const url = `https://walixz.com/`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const list = $("article.entry").get ();

    const out= await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('h2 > a').text();
            const address = $('h2 > a').attr('href');
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
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '瓦力箱子',
        link: url,
        item: out,
    };  
};
