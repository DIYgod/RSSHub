const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');

async function load(link, need_feed_description) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const article = $('.blog_content').removeAttr('style');
    article.find('img').removeAttr('style');
    article
        .find('div')
        // Non-breaking space U+00A0, `&nbsp;` in html
        // element.children[0].data === $(element, article).text()
        .filter((_, element) => element.children[0].data === String.fromCharCode(160))
        .remove();
    const description = article.html();

    const item = { description };

    if (need_feed_description) {
        const author = $('div.widget.author_detail p:nth-child(2)');
        // workaround to split author name and author article
        const author_name = author.find('strong');
        author_name.text(author_name.text() + '，');
        item.feed_description = author.text();
    }
    return item;
}

module.exports = async (ctx) => {
    const { column } = ctx.params;
    const link = `http://${column}.blog.caixin.com`;
    const feed_url = `${link}/feed`;
    const feed = await parser.parseURL(feed_url);

    const title = `财新博客 - ${/[^»]*$/.exec(feed.title)[0]}`;

    const items = await Promise.all(
        feed.items.slice(0, 10).map(async (item, index) => {
            const link = item.link;
            const single = {
                title: item.title,
                pubDate: item.pubDate,
                link,
                author: item['dc:creator'],
            };
            const other = await ctx.cache.tryGet(link, () => load(link, index === 0));
            return Promise.resolve(Object.assign({}, single, other));
        })
    );

    ctx.state.data = {
        title,
        link,
        description: items[0].feed_description,
        item: items,
    };
};
