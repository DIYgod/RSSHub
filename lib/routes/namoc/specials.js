const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'http://www.namoc.org/xwzx/jdzt/2018zhuanti/';

module.exports = async (ctx) => {
    const response = await got.get(host);

    const $ = cheerio.load(response.data);

    const list = $('div.inner div.list li').slice(0, 5).get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('div.text a').text();
            const itemUrl = $('div.text a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const cover = $('p.image a')
                .html()
                .replace(/src="./g, `src="${host}`);

            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
                description: cover + $('div.text div').html(),
                pubDate: new Date($('span.date').text()).toUTCString(),
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '中国美术馆 -- 焦点专题',
        link: host,
        item: out,
    };
};
