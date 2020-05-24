const cheerio = require('cheerio');
const dayjs = require('dayjs');
const got = require('@/utils/got');

module.exports = {
    ProcessFeed: async (link, ctx) => {
        const got_ins = got.extend({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:76.0) Gecko/20100101 Firefox/76.0',
            },
        });

        const res = await got_ins.get(link);

        const $ = cheerio.load(res.data);
        const list = $('#mainContent .news_li').slice(0, 10).get();

        return await Promise.all(
            list.map(async (item) => {
                const $ = cheerio.load(item);
                const itemUrlID = $(item).find('.news_tu a').attr('href');
                const itemUrl = `https://www.thepaper.cn/${itemUrlID}`;
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                const res = await got_ins.get(itemUrl);
                const content = cheerio.load(res.data);
                const serverOffset = new Date().getTimezoneOffset() / 60;
                const author = content('.newscontent .news_about p').slice(0, 1).text();
                content('.newscontent .news_about p span').remove();
                const pubDateStr = content('.newscontent .news_about p').slice(1, 2).text().trim();
                const single = {
                    title: content('.newscontent .news_title').text(),
                    guid: itemUrl,
                    link: itemUrl,
                    description: content('.newscontent .news_txt').html(),
                    pubDate: dayjs(pubDateStr)
                        .add(-8 - serverOffset, 'hour')
                        .toISOString(),
                    author: author,
                };
                return Promise.resolve(single);
            })
        );
    },
};
