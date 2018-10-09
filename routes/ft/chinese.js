const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const utils = require('./utils');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    let feed;

    if (ctx.params.channel) {
        let channel = ctx.params.channel.toLowerCase();
        channel = channel.split('-').join('/');

        try {
            feed = await parser.parseURL(`http://www.ftchinese.com/rss/${channel}`);
        } catch (error) {
            ctx.state.data = {
                title: `FT 中文网 ${channel} 不存在`,
                description: `FT 中文网 ${channel} 不存在`,
            };
            return;
        }
    } else {
        feed = await parser.parseURL('http://www.ftchinese.com/rss/feed');
    }

    const items = await Promise.all(
        feed.items.splice(0, 10).map(async (item) => {
            const response = await axios({
                method: 'get',
                url: `${item.link}?full=y&archive`,
            });

            const $ = cheerio.load(response.data);

            const result = utils.ProcessFeed($, item.link);

            const single = {
                title: item.title,
                description: result.content,
                author: result.author,
                pubDate: item.pubDate,
                link: item.link,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};
