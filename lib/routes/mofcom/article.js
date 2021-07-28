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
    const list = $('.txtList_01 li').get();

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

            let responses = await got.get(itemUrl);
            const redirect = responses.data.match(/window\.location\.href='(.*)'/);
            if (redirect) {
                responses = await got.get(redirect[1], {
                    headers: {
                        Referer: itemUrl,
                        'Accept-Encoding': 'gzip, deflate',
                        'Accept-Language': 'zh-CN,zh;q=0.9',
                        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                    },
                });
            }
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                link: itemUrl,
                description: $d('.art-con').html() || $d('.textlive').html(),
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
