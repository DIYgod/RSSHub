const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const fetch = require('./fetch_article');

module.exports = async (ctx) => {
    const url = 'https://cse.csu.edu.cn/index/';
    const type = ctx.params.type ?? 'tzgg';
    const link = url + type + '.htm';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.download li').get();
    const out = await Promise.all(
        list.map((item) => {
            const $ = cheerio.load(item);
            const address = new URL($('a').attr('href'), url);
            const title = $('a').text();
            const pubDate = $('span').text();
            return ctx.cache.tryGet(address, async () => {
                const single = await fetch(address);
                single.title = title;
                single.pubDate = parseDate(pubDate, 'YYYY/MM/DD');
                return single;
            });
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link,
        item: out,
    };
};
