const got = require('@/utils/got');
const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.ghxi.com';
    const feed = await parser.parseURL(`${rootUrl}/feed`);
    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                $('.comments, .vipdown-form').prev().nextAll().remove();


                const single = {
                    title: item.title,
                    description: $('content\\:encoded').html(),
                    pubDate: item.pubDate,
                    link: item.link,
                    author: item['dc:creator'],
                    category: item.categories,
                };
                return single;
            })
        )
    );
    ctx.state.data = {
        title: '果核剥壳',
        link: rootUrl,
        item: items,
    };
};
