const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

let host = 'http://news.fznews.com.cn/fzxw/';
let citytitle = '福州新闻';

module.exports = async (ctx) => {
    if (ctx.params.city === 'fj') {
        host = 'http://news.fznews.com.cn/dsxw/';
        citytitle = '福建新闻';
    } else {
        host = 'http://news.fznews.com.cn/fzxw/';
        citytitle = '福州新闻';
    }

    const response = await got.get(host);
    const $ = cheerio.load(response.data);
    const list = $('.li-h32f14 li:not(.clearfix)').slice(0, ctx.params.limit).get();
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
            const contents = capture('.zhengwen').html();
            const time = capture('div.laiyuan div.left').text().substring(0, 19);
            const author = capture('.laiyuan').text().replace('分享到：', '');

            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
                author: author,
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
