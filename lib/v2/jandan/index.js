const got = require('@/utils/got');
const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const rootUrl = 'http://i.jandan.net';
    const feed = await parser.parseURL(`${rootUrl}/feed/`);
    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                $('.wechat-hide').prev().nextAll().remove();
                const single = {
                    title: item.title,
                    description: $('.entry').html(),
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
        title: '煎蛋',
        link: rootUrl,
        item: items,
    };
};
