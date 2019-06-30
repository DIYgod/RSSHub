const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = 'http://www.csrc.gov.cn/pub/newsite/zjhxwfb/xwdd/';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.fl_list li').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('span').text();
            const title = $('a').text();
            const sub_url = $('a')
                .attr('href')
                .slice(2);
            const itemUrl = url + sub_url;
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
                description: $d('.content .Custom_UnionStyle').html(),
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
