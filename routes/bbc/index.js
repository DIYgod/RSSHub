const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const utils = require('./utils');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    let feed, title, link;

    if (ctx.params.channel) {
        switch (ctx.params.channel.toLowerCase()) {
            case 'chinese':
                feed = await parser.parseURL('http://feeds.bbci.co.uk/zhongwen/simp/rss.xml');
                title = 'BBC 中文网';
                link = 'https://www.bbc.com/zhongwen/simp';
                break;
            case 'world':
                feed = await parser.parseURL('http://feeds.bbci.co.uk/news/world/rss.xml');
                title = 'BBC News World';
                link = 'https://www.bbc.co.uk/news/world';
                break;
            default:
                feed = await parser.parseURL('http://feeds.bbci.co.uk/news/world/rss.xml');
                title = 'BBC News World';
                link = 'https://www.bbc.co.uk/news/world';
                break;
        }
    } else {
        feed = await parser.parseURL('http://feeds.bbci.co.uk/news/world/rss.xml');
        title = 'BBC News World';
        link = 'https://www.bbc.co.uk/news/world';
    }

    const items = await Promise.all(
        feed.items.splice(0, 10).map(async (item) => {
            const response = await axios({
                method: 'get',
                url: item.link,
            });

            const $ = cheerio.load(response.data);

            const description = utils.ProcessFeed($, item.link).html();

            const single = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: item.link,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title,
        link,
        description: title,
        item: items,
    };
};
