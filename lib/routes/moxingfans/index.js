const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'http://www.moxingfans.com/';
    const response = await got({
        method: 'get',
        url: baseUrl + 'new',
    });
    const $ = cheerio.load(response.data);
    const list = $('article').get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        return {
            desc: $('article.article-content').html(),
            publish_time: $('time').text(),
        };
    };

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('header > h2 > a');
            const link = baseUrl + $a.attr('href');
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
            });
            const feed = ProcessFeed(response.data);
            const description = feed.desc;
            const pubDate = feed.publish_time;

            const single = {
                title: $a.text(),
                description,
                link,
                pubDate,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '静态模型爱好者', link: baseUrl, item: out };
};
