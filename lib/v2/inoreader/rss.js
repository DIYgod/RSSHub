const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const tag = ctx.params.tag;
    const rootUrl = 'https://www.inoreader.com/stream';
    const rssUrl = `${rootUrl}/user/${user}/tag/${tag}`;
    const feed = await parser.parseURL(rssUrl);
    feed.items = feed.items.map((item) => ({
        title: item.title,
        pubDate: item.pubDate,
        link: item.link,
        description: item.content,
        category: item.categories,
    }));
    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: feed.items,
    };
};
