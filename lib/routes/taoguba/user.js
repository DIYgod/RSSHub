const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.taoguba.com.cn/blog/${ctx.params.uid}`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.article_tittle').get();

    const out = await Promise.all(
        list.slice(0, 3).map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.tittle_data.left a').attr('title');
            const partial = $('.tittle_data.left a').attr('href');
            const address = `https://www.taoguba.com.cn/${partial}`;
            const time = $('div.tittle_fbshijian.left').text();
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
        title: $('title').text(),
        link: url,
        item: out,
    };
};
