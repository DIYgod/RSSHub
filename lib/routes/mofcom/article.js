const cheerio = require('cheerio');
const got = require('@/utils/got');
const { resolve } = require('url');

const host = 'http://www.mofcom.gov.cn';

module.exports = async (ctx) => {
    const suffix = ctx.params.suffix;
    const url = resolve('http://www.mofcom.gov.cn/article/', suffix);
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const title = $('head > title').text();
    const list = $('.u-newsList01.f-mt10 li').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').attr('title');
            const sub_url = $('a').attr('href');
            const itemUrl = resolve(host, sub_url);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                link: itemUrl,
                description: $d('.artCon').html(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: title,
        link: url,
        item: out,
    };
};
