const got = require('@/utils/got');
const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'category';
    const category = ctx.params.category || 'pick';
    const feed = await parser.parseURL(`http://www.codeceo.com/article/${type}/${category}/feed`);

    const ProcessFeed = async (link) => {
        const response = await got({
            method: 'get',
            url: link,
        });

        const $ = cheerio.load(response.data);

        $('.article-entry script').remove();
        $('.article-entry .adsbygoogle').parent().remove();

        return $('.article-entry').html();
    };

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const description = await ProcessFeed(item.link);

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
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};
