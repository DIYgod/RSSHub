const cheerio = require('cheerio');
const date = require('@/utils/date');
const got = require('@/utils/got');

module.exports = {
    ProcessFeed: async (link, ctx) => {
        const res = await got.get(link);

        const $ = cheerio.load(res.data);
        const list = $('.list_item').slice(0, 10).get();

        return await Promise.all(
            list.map(async (item) => {
                const $ = cheerio.load(item);
                const itemUrlID = $(item).find('.list_item_title a').attr('href');
                const itemUrl = `https://m.thepaper.cn/${itemUrlID}`;
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const res = await got.get(itemUrl);
                const content = cheerio.load(res.data);

                content('.contheight').replaceWith('<br>');

                const single = {
                    title: content('.news_video_name').text() || content('.title').text(),
                    link: itemUrl,
                    description: content('#vdetail_sum_p').html() || content('.news_part_limit div').html(),
                    pubDate: date(content('.date').text().trim()),
                    author: content('.author').text(),
                };
                return Promise.resolve(single);
            })
        );
    },
};
