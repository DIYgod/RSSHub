const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.taoguba.com.cn/index`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.p_list01').get();

    const out = await Promise.all(
        list.slice(0, 5).map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('.pcdj06').text();
            const title = $('.pcdj02 a').attr('title');
            const partial = $('.pcdj02 a').attr('href');
            const address = `https://www.taoguba.com.cn/${partial}`;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const get = cheerio.load(res.data);
            get('img').each((index, item) => {
                item = get(item);
                item.attr('src', item.attr('data-original'));
                item.removeAttr('onload');
            });
            const contents = get('div#first.p_coten').html();
            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                description: contents,
                link: address,
                guid: address,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '淘股吧股票论坛总版',
        link: url,
        item: out,
    };
};
