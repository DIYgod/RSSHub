const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const tag = ctx.params.tag;
    const rootUrl = 'https://www.inoreader.com/stream';
    const rssUrl = `${rootUrl}/user/${user}/tag/${tag}`;
    const feed = await parser.parseURL(rssUrl);
    feed.items = feed.items.map((item) => {
        if (item?.enclosure?.type.includes('audio')) {
            // output podcast rss
            // get first image in content
            const $ = cheerio.load(item.content);
            const firstImgSrc = $('img').first().attr('src');

            return {
                title: item.title,
                pubDate: item.pubDate,
                link: item.link,
                description: item.content,
                category: item.categories,
                itunes_item_image: firstImgSrc,
                enclosure_url: item.enclosure.url,
                enclosure_length: item.enclosure.length,
                enclosure_type: item.enclosure.type,
            };
        }
        return {
            title: item.title,
            pubDate: item.pubDate,
            link: item.link,
            description: item.content,
            category: item.categories,
        };
    });
    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: feed.items,
    };
};
