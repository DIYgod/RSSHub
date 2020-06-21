const cheerio = require('cheerio');
const date = require('@/utils/date');
const got = require('@/utils/got');

module.exports = {
    ProcessFeed: async (link, ctx) => {
        const res = await got.get(link);

        const $ = cheerio.load(res.data);
        const list = $('.t_news').slice(0, 10).get();

        return await Promise.all(
            list.map(async (item) => {
                const $ = cheerio.load(item);
                const itemUrlID = $(item).find('.news_tit02 a').attr('href');
                const itemUrl = `https://m.thepaper.cn/${itemUrlID}`;
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const res = await got.get(itemUrl);
                const content = cheerio.load(res.data);

                content('.contheight').replaceWith('<br>');

                const single = {
                    title: content('h1.t_newsinfo').text(),
                    link: itemUrl,
                    description: $(content('.news_part_limit div')[0]).html(),
                    pubDate: date($(content('.about_news')[1]).text().trim()),
                    author: $(content('.about_news')[0]).text(),
                };
                return Promise.resolve(single);
            })
        );
    },
};
