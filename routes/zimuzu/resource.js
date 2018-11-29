const Parser = require('rss-parser');
const parser = new Parser({
    customFields: {
        item: ['magnet'],
    },
});

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const feed = await parser.parseURL(`http://diaodiaode.me/rss/feed/${id}`);
    console.log(feed);
    feed.items.map((item) => {
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
