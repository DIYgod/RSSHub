const Parser = require('rss-parser');
const parser = new Parser();
const apiUrl = 'http://api.ibc.co.jp/streaming/rss/28/';
const img = 'https://cdn.ibc.co.jp/radio/maitta/audio/images/header.png';

module.exports = async (ctx) => {
    const feed = await parser.parseURL(apiUrl);

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const itemId = item.link.substring(23, 28);

            const single = {
                title: item.title,
                description: item.content,
                pubDate: item.pubDate,
                link: item.link,
                itunes_item_image: img,
                enclosure_url: `https://media-data.cdn.ibc.co.jp/out/sound/28_${itemId}/28_${itemId}.mp3`,
                enclosure_type: 'audio/mpeg',
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        language: feed.language,
        description: feed.description,
        itunes_author: 'IBC',
        image: img,
        item: items,
    };
};
