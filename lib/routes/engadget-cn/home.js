const got = require('@/utils/got');
const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const feed = await parser.parseURL('https://cn.engadget.com/rss.xml');

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        return $.html('#page_body .stretch-img') + '<br>' + $.html('.article-text');
    };

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: item.link,
            });

            const description = ProcessFeed(response.data);
            const single = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: item.link,
                author: item.author,
            };
            ctx.cache.set(item.link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'Engadget 中文版 全文',
        link: 'https://cn.engadget.com/',
        description: feed.description,
        item: items,
    };
};
