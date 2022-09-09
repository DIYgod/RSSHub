const got = require('@/utils/got');
const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const feed = await parser.parseURL('https://www.deepmind.com/blog/rss.xml');

    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = cheerio.load(data);

                item.description = $('.e_container .c_rich-text__cms').html();

                delete item.content;
                delete item.contentSnippet;
                delete item.isoDate;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: feed.title,
        description: feed.description,
        image: 'https://assets-global.website-files.com/621d30e84caf0be3291dbf1c/621d336835a91420c6a8dcf2_webclip.png',
        link: `${feed.link}/blog`,
        item: items,
        language: 'en',
    };
};
