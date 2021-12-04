const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

let host = 'http://m.hxnews.com/news/fj/fz';
let citytitle = '福州新闻';

module.exports = async (ctx) => {

 // 限制为25时转到备用网站
 if (ctx.params.limit === '25' ) {

    if (ctx.params.city === 'fj') {
        host = 'http://www.mnw.cn/news/fj';
        citytitle = '福建新闻-闽南网';
    } else {
        host = 'http://www.mnw.cn/news/fz';
        citytitle = '福州新闻-闽南网';
    }

    const response = await got.get(host);
    const $ = cheerio.load(response.data);
    const list = $('.item').slice(0, ctx.params.limit).get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            const itemUrl = url.resolve(host, $('a').attr('href'));

            // 临时参数，用以获取作者和推送时间
            const author00 = $('span').text().replace('&nbsp;');
            const author = author00.substring( author00.indexOf('来源:') + 3 );
            const time = $('span').text().substring(0, 16) + ':00';


            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const res = await got.get(itemUrl);
            const capture = cheerio.load(res.data);
            const contents = capture('.icontent').html();

            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
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

  } else {

    if (ctx.params.city === 'fj') {
        host = 'http://m.hxnews.com/news/fj';
        citytitle = '福建新闻-海峡网';
    } else {
        host = 'http://m.hxnews.com/news/fj/fz';
        citytitle = '福州新闻-海峡网';
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
            const author = capture('div.nr').eq(0).text();

            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
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

   }

};
