const axios = require('../../utils/axios');
const utils = require('./utils');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('https://cn.nytimes.com/rss/');
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
                author: item['dc:creator'],
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '纽约时报中文网 国际纵览',
        link: 'https://cn.nytimes.com',
        description: '纽约时报中文网 国际纵览',
        item: items,
    };
};
