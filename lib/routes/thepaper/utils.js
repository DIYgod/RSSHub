const cheerio = require('cheerio');
const date = require('@/utils/date');
const got = require('@/utils/got');

module.exports = {
    ProcessFeed: async (query, link, ctx) => {
        const res = await got.get(link);

        const $ = cheerio.load(res.data);
        const list = $(query).slice(0, 10).get();

        return Promise.all(
            list.map(async (item) => {
                const $ = cheerio.load(item);
                const itemUrl = `https://m.thepaper.cn/${$(item).find('a').eq(0).attr('href')}`;
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const res = await got.get(itemUrl);
                const content = cheerio.load(res.data);

                let description, pubDate, auth;

                if (content('div.news_video_msg').length > 0) {
                    description = content('#vdetail_sum').html();
                    const metaInfo = content('div.news_video_msg').html().split('&nbsp;&nbsp;');
                    pubDate = metaInfo[0];
                    auth = metaInfo[1];
                } else if (content('#slider_wrapper_ul').length > 0) {
                    description = '';
                    pubDate = new Date(date($(item).find('div.list_item_extra span').eq(1).text())).toUTCString();
                    auth = content('div.author').text();
                } else {
                    description = content('div.newsdetail_content').html();
                    pubDate = new Date(content('div.date').text().trim().split('来源：')[0].trim() + ' GMT+8').toUTCString();
                    auth = content('span.name').text();
                }

                const single = {
                    title: content('title').text(),
                    link: itemUrl,
                    description,
                    pubDate,
                    author: auth,
                };
                return Promise.resolve(single);
            })
        );
    },
};
