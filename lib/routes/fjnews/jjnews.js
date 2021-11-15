import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';
const host = 'http://tt.m.jxnews.com.cn/jjtop/';

export default async (ctx) => {
    const response = await got.get(host);
    const $ = cheerio.load(response.data);
    const list = $('li.col-xs-12').get();
    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.list-text-style').text();
            const itemUrl = url.resolve(host, $('a').attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const res = await got.get(itemUrl);
            const capture = cheerio.load(res.data);
            const contents = capture('content').html();
            const time = capture('div.col-xs-8').text().substring(0, 19);

            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
                description: contents,
                pubDate: new Date(time).toUTCString(),
            };

            return single;
        })
    );

    ctx.state.data = {
        title: '九江新闻',
        link: host,
        item: out,
    };
};
