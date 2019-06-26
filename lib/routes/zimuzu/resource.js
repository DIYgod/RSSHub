const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const { id = 0 } = ctx.params;
    const feed = await parser.parseURL(`http://rss.rrys.tv/rss/feed/${id}`);
    feed.items.map((item) => {
        item.link = null;
        item.enclosure_url = item.magnet;
        item.enclosure_type = 'application/x-bittorrent';
        return item;
    });

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: feed.items,
    };
};
