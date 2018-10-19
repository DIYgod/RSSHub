const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let host = 'http://www.ifanr.com';

    if (ctx.params.channel) {
        let channel = ctx.params.channel.toLowerCase();
        channel = channel.split('-').join('/');

        // 兼容旧版路由
        if (channel === 'appso') {
            host = `${host}/app`;
        } else {
            host = `${host}/${channel}`;
        }
    } else {
        host = `${host}/app`;
    }

    const response = await axios.get(host);

    const $ = cheerio.load(response.data);

    const list = $('h3 a')
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list.map(async (itemUrl) => {
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);
            const title = $('h1').text();

            const single = {
                title,
                link: itemUrl,
                author: $('.c-article-header-meta__category').html(),
                description: $('article').html(),
                pubDate: new Date($('.c-article-header-meta__time').attr('data-timestamp') * 1000),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${$('h1.c-archive-header__title').text()}：${$('div.c-archive-header__desc').text()}`,
        link: host,
        item: out,
    };
};
