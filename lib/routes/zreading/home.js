const got = require('@/utils/got');
const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const feed = await parser.parseURL('http://www.zreading.cn/feed');

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        $('script').remove();
        $('.adsbygoogle').remove();

        // 还原图片地址
        $('img').each((index, elem) => {
            const $elem = $(elem);
            $elem.attr('referrerpolicy', 'no-referrer');
        });

        // 提取内容
        return $('.grap').html();
    };

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: item.link,
            });

            const description = ProcessFeed(response.data);

            const single = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: item.link,
                author: item.author,
            };
            ctx.cache.set(item.link, JSON.stringify(single));
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
