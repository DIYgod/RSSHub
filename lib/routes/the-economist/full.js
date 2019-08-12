const parser = require('@/utils/rss-parser');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const endpoint = ctx.params.endpoint;
    const feed = await parser.parseURL(`https://www.economist.com/${endpoint}/rss.xml`);

    const getFullText = async (link) => {
        let content = await ctx.cache.get(link);
        if (content) {
            return content;
        }

        const response = await got({
            method: 'get',
            url: link,
        });
        const $ = cheerio.load(response.data);

        $('.newsletter-form--inline').remove();
        $('.blog-post__asideable-wrapper').remove();

        content = '<div>[' + $('h1 .flytitle-and-title__flytitle').text() + ']</div>';
        content += '<div><i>' + $('.blog-post__description').text() + '</i></div>';
        content += '<br />';
        content += $('.blog-post__inner').html();

        ctx.cache.set(link, content);

        return content;
    };

    const items = await Promise.all(
        feed.items.map(async (item) => ({
            title: item.title,
            description: await getFullText(item.link),
            link: item.link,
            guid: item.guid,
            pubDate: item.pubDate,
        }))
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};
