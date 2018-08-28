const axios = require('../../utils/axios');
const cheerio = require('cheerio');

const host = 'http://www.ifanr.com/app';

module.exports = async (ctx) => {
    const response = await axios.get(host);

    const $ = cheerio.load(response.data);

    const list = $('h3 a')
        .map((i, e) => $(e).attr('href'))
        .get();
    const out = [];

    for (let i = 0; i < Math.min(list.length, 5); i++) {
        const itemUrl = list[i];
        const response = await axios.get(itemUrl);
        const $ = cheerio.load(response.data);
        const title = $('h1').text();
        const cache = await ctx.cache.get(itemUrl);
        if (cache) {
            out.push(JSON.parse(cache));
            continue;
        }

        const single = {
            title,
            link: itemUrl,
            guid: itemUrl,
            author: $('.c-article-header-meta__category').html(),
            description: $('article').html(),
            pubDate: new Date($('.c-article-header-meta__time').attr('date-timestamp')),
        };
        out.push(single);
        ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
    }

    ctx.state.data = {
        title: 'AppSo : 让手机更好用的数字生活媒体',
        link: host,
        item: out,
    };
};
