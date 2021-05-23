const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got('http://www.woshipm.com/__api/v1/browser/popular');
    const result = await Promise.all(
        response.data.payload.map(async (item) => {
            const title = item.title;
            const link = item.permalink;
            const guid = item.id;
            const pubDate = new Date(item.date).toUTCString();

            const single = {
                title: title,
                link: link,
                guid: guid,
                pubDate: pubDate,
                description: '',
            };

            const key = 'woshipm' + guid;
            const value = await ctx.cache.get(key);

            if (value) {
                single.description = value;
            } else {
                const temp = await got(link);
                const $ = cheerio.load(temp.data);
                single.description = $('.grap').html();

                ctx.cache.set(key, single.description);
            }

            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '热门文章 - 人人都是产品经理', link: 'http://www.woshipm.com/', item: result };
};
