const axios = require('../../utils/axios');
const cheerio = require('cheerio');

const host = 'http://www.namoc.org/xwzx/jdzt/2018zhuanti/';

module.exports = async (ctx) => {
    const response = await axios.get(host);

    const $ = cheerio.load(response.data);

    const list = $('div.inner div.list li');
    const out = [];

    for (let i = 0; i < Math.min(list.length, 5); i++) {
        const $ = cheerio.load(list[i]);
        const title = $('div.text a').text();
        const itemUrl = $('div.text a').attr('href');
        const cache = await ctx.cache.get(itemUrl);
        if (cache) {
            out.push(JSON.parse(cache));
            continue;
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
        out.push(single);
        ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
    }

    ctx.state.data = {
        title: '中国美术馆 -- 焦点专题',
        link: host,
        item: out,
    };
};
