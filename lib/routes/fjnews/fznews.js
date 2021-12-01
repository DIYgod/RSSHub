const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

let host = 'http://m.hxnews.com/news/fj/fz';
let citytitle = '福州新闻';

module.exports = async (ctx) => {
    if (ctx.params.city === 'fj') {
        host = 'http://m.hxnews.com/news/fj';
        citytitle = '福建新闻';
    } else {
        host = 'http://m.hxnews.com/news/fj/fz';
        citytitle = '福州新闻';
    }

    const response = await got.get(host);
    const $ = cheerio.load(response.data);
    const list = $('.ui-mod-picsummary').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            const itemUrl = url.resolve(host, $('a').attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const res = await got.get(itemUrl);
            const capture = cheerio.load(res.data);
            const contents = capture('.add-cont-m').html();
            const time = capture('div.nr').eq(1).text().substring(0, 16) + ':00';
            const author = capture('div.nr ml0').text();

            const single = {
                title,
                link: itemUrl,
                author,
                description: contents,
                pubDate: new Date(time).toUTCString(),
            };

            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: citytitle,
        link: host,
        item: out,
    };
};
