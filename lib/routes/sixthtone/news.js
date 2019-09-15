const got = require('@/utils/got');
const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const feed = await parser.parseURL('https://www.sixthtone.com/rss');

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        // 移除广告等内容
        $('[class*="advertise-"]').remove();

        // 提取内容
        return $('.content').html();
    };

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const link = 'https:' + item.link.match(/\/\/www.sixthtone.com\/news\/\d+\//g)[0];

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
            });

            const description = ProcessFeed(response.data);

            const single = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: link,
                author: item.author,
            };
            ctx.cache.set(link, JSON.stringify(single));
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
