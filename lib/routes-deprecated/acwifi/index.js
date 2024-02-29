const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.acwifi.net/';
    const response = await got({
        method: 'get',
        url: baseUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.widget.widget_recent_entries li').get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        return {
            desc: $('article.article-content').html(),
        };
    };

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('a');
            const link = $a.attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got({
                method: 'get',
                url: link,
            });
            const feed = ProcessFeed(response.data);
            const description = feed.desc;

            const single = {
                title: $a.text(),
                description,
                link,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = { title: '路由器交流', link: baseUrl, item: out };
};
