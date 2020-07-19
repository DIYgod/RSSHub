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

        $('aside').remove();
        $('div.ds-chapter-list').remove();
        content = $('div.article__lead-image').html();
        content += $('header.article__header').html();
        content += $('div.layout-article-body').attr('itemprop', 'text').html();

        ctx.cache.set(link, content);

        return content;
    };

    const items = await Promise.all(
        feed.items.slice(0, 10).map(async (item) => ({
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
