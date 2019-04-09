const axios = require('../../utils/axios');
const utils = require('./utils');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    let title = '9To5',
        link,
        description;

    switch (ctx.params.type) {
        case 'mac':
            link = 'https://9to5mac.com/feed';
            title += 'Mac';
            description = 'Apple News & Mac Rumors Breaking All Day';
            break;

        case 'google':
            link = 'https://9to5google.com/feed';
            title += 'Google';
            description = 'Google, Pixel news, Android, Home, Chrome OS, apps, more';
            break;

        case 'toys':
            link = 'https://9to5toys.com/feed';
            title += 'Toys';
            description = 'New Gear, reviews and deals';
            break;

        default:
            break;
    }

    const feed = await parser.parseURL(link);

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
        title,
        link,
        description,
        item: items,
    };
};
