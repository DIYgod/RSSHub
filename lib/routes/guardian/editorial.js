const axios = require('../../utils/axios');
const utils = require('./utils');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('https://www.theguardian.com/tone/editorials/rss');
    const items = await Promise.all(
        feed.items.splice(0, 10).map(async (item) => {
            const response = await axios({
                method: 'get',
                url: item.link,
            });
            const description = utils.ProcessFeed(response.data);

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
        title: 'The Guardian - Editorial',
        link: 'https://www.theguardian.com/profile/editorial',
        description: 'The Guardian - Editorial',
        item: items,
    };
};
