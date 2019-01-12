const axios = require('../../utils/axios');
const utils = require('./utils');
const Parser = require('rss-parser');
const parser = new Parser();

const config = {
    editorial: {
        link: `https://www.theguardian.com/profile/editorial`,
        title: 'Editorial',
        rss: 'https://www.theguardian.com/tone/editorials/rss',
    },
    china: {
        link: `https://www.theguardian.com/world/china`,
        title: 'China',
        rss: 'https://www.theguardian.com/world/china/rss',
    },
};

module.exports = async (ctx) => {
    const type = config[ctx.params.type];
    const feed = await parser.parseURL(type.rss);
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
        title: 'The Guardian - ' + type.title,
        link: type.link,
        description: 'The Guardian - ' + type.title,
        item: items,
    };
};
