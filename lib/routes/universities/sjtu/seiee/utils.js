const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://bjwb.seiee.sjtu.edu.cn';

module.exports = function (meta, extract) {
    return async (ctx) => {
        const { title, local, author } = meta(ctx);

        const link = url.resolve(host, local);
        const response = await got.get(link);

        const list = extract(cheerio.load(response.data));

        const out = await Promise.all(
            list.map(async (item) => {
                const itemUrl = url.resolve(host, item.link);
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);

                const single = {
                    title: item.title,
                    link: itemUrl,
                    author,
                    description: $('.article_content').text(),
                    pubDate: new Date(item.date).toUTCString(),
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            })
        );

        ctx.state.data = {
            title,
            link,
            item: out,
        };
    };
};
