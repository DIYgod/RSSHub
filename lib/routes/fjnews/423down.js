const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
let host = 'https://www.423down.com/apk';
let citytitle = '423下载';

module.exports = async (ctx) => {

    const response = await got.get(host);
    const $ = cheerio.load(response.data);
    const list = $('.excerpt li').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').eq(1).text();
            const itemUrl = url.resolve(host, $('a').eq(0).attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const res = await got.get(itemUrl);
            const capture = cheerio.load(res.data);
            const contents = capture('div.entry').html();
            //const time = capture('div.col-xs-8').text().substring(0, 19);

            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
                description: contents,
                //pubDate: new Date(time).toUTCString(),
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
