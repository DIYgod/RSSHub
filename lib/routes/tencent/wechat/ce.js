const parser = require('@/utils/rss-parser');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const feed = await parser.parseURL(`https://posts.careerengine.us/author/${id}/rss`);

    const items = await Promise.all(
        feed.items.splice(0, 10).map(async (item) => {
            const response = await got.get(item.link);

            const $ = cheerio.load(response.data);
            const post = $('.post');

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
        title: `微信公众号 - ${feed.title}`,
        link: `https://posts.careerengine.us/author/${id}/posts`,
        description: feed.description,
        item: items,
    };
};
