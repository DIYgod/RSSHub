const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response_1 = await got('http://www.woshipm.com/__api/v1/stream-list');
    const response_2 = await got('http://www.woshipm.com/__api/v1/stream-list/page/2');
    const response_3 = await got('http://www.woshipm.com/__api/v1/stream-list/page/3');
    const payload = [...response_1.data.payload, ...response_2.data.payload, ...response_3.data.payload];
    const result = await Promise.all(
        payload.map(async (item) => {
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
    ctx.state.data = {
        title: '最新文章 - 人人都是产品经理',
        link: 'http://www.woshipm.com/',
        item: result,
    };
};
