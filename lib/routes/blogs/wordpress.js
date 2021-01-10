const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const scheme = ctx.params.https || 'https';
    const domain = `${scheme}://${ctx.params.domain}`;
    const feed = await parser.parseURL(`${domain}/feed/`);
    const items = await Promise.all(
        feed.items.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const article = {
                title: item.title,
                description: item['content:encoded'],
                pubDate: item.pubDate,
                link: item.link,
                author: item.creator,
            };
            return Promise.resolve(article);
        })
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};
