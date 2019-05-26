const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('http://meipin.im/feed');

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        const content = $('div.entry-content');

        return content.html();
    };

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const response = await axios({
                method: 'get',
                url: item.link,
            });

            const single = {
                guid: item.guid,
                title: item.title,
                description: ProcessFeed(response.data),
                pubDate: item.pubDate,
                link: item.link,
                author: item['dc:creator'],
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '没品',
        link: 'http://meipin.im',
        description: '没品笑话集。',
        item: items,
    };
};
