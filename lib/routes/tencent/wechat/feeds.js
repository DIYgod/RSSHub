const parser = require('@/utils/rss-parser');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://github.com/hellodword/wechat-feeds/raw/feeds/${id}.xml`;
    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.splice(0, 20).map(async (item) => {
            const response = await got.get(item.link);

            const $ = cheerio.load(response.data);
            const post = $('#js_content');

            post.find('img').each((_, img) => {
                const dataSrc = $(img).attr('data-src');
                if (dataSrc) {
                    $(img).attr('src', dataSrc);
                }
            });

            const single = {
                title: item.title,
                description: post.html(),
                pubDate: item.pubDate,
                link: item.link,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${feed.title}`,
        link,
        description: feed.description,
        item: items,
    };
};
