const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const rssUrl = `https://animixplay.com/rss.xml`;
    const feed = await parser.parseURL(rssUrl);
    feed.item=feed.items
    delete feed['items']
    ctx.state.data = feed;
};
