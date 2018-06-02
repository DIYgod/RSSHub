const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('https://cn.nytimes.com/rss/');
    const items = [];
    feed.items.forEach((item) => {
        if (item.title.startsWith('早报：')) {
            items.push({
                title: item.title,
                description: item.content,
                pubDate: item.pubDate,
                guid: item.guid,
                link: item.link,
            });
        }
    });

    ctx.state.data = {
        title: '纽约时报 新闻早报',
        link: encodeURI('https://cn.nytimes.com/search?query=%E6%97%A9%E6%8A%A5&lang=&dt=json&from=0&size=10'),
        description: '纽约时报 新闻早报',
        item: items,
    };
};
