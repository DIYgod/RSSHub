const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const { url } = ctx.params;
    const feed = await parser.parseURL(url);

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        allowEmpty: false,
        item: feed.items.map((item) => ({
            title: item.title,
            description: item.content,
            pubDate: item.pubDate,
            link: item.link,
            author: item.creator,
        })),
    };
};
