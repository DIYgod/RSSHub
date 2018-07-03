const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const session = ctx.params.session;
    const feed = await parser.parseURL('http://diaodiaode.me/rss/feed/' + id);
    const items = [];
    feed.items.forEach((item) => {
        if (item.title.indexOf(session) != -1) {
            items.push({
                title: item.title,
                pubDate: item.pubDate,
                guid: item.guid,
                link: item.magnet,
            });
        }
    });

    ctx.state.data = {
        title: feed.title,
        link: encodeURI('http://www.zimuzu.tv'),
        description: feed.description,
        item: items,
    };
};
