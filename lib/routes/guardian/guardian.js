const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const utils = require('./utils');

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
            const response = await got({
                method: 'get',
                url: item.link,
            });
            const description = utils.ProcessFeed(response.data);

            const single = {
                title: item.title,
                description: description ? description : item.content,
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
