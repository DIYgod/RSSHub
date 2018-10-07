const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const utils = require('./utils');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('http://feeds.bbci.co.uk/zhongwen/simp/rss.xml');

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
        title: 'BBC News 中文',
        link: 'https://www.bbc.com/zhongwen/simp',
        description: 'BBC News 中文',
        item: items,
    };
};
