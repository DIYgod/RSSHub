const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('http://feeds.bbci.co.uk/zhongwen/simp/rss.xml');
    const items = [];
    feed.items.forEach((item) => {
        items.push({
            title: item.title,
            description: item.content,
            pubDate: item.pubDate,
            guid: item.guid,
            link: item.link,
        });
    });

    ctx.state.data = {
        title: 'BBC News 中文',
        link: 'https://www.bbc.com/zhongwen/simp',
        description: 'BBC News 中文',
        item: items,
    };
};
