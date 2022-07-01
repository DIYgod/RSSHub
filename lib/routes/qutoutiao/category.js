const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const cid = ctx.params.cid;
    const url = `http://api.1sapp.com/content/outList?cid=${cid}&tn=1&page=1&limit=10`;
    const response = await got.get(url);
    const result = response.data.data.data;

    const out = await Promise.all(
        result.map(async (item) => {
            const title = item.title;
            const date = item.show_time;
            const itemUrl = item.url;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $('.content')
                .html()
                .replace(/data-src/g, `src`);

            const single = {
                title,
                link: itemUrl,
                description,
                pubDate: new Date(date * 1000).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '趣头条',
        link: 'http://home.qutoutiao.net',
        description: '趣头条',
        item: out,
    };
};
