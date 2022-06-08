const parser = require('@/utils/rss-parser');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const getArticleDetail = async (link, ctx) =>
    await ctx.cache.tryGet(link, async () => {
        const response = await got(link);
        const $ = cheerio.load(response.data);
        $('div.article-audio-player__center-tooltip').remove();
        const nextData = JSON.parse($('head script[type="application/ld+json"]').text());

        const article = $('#new-article-template > div > div.css-wvfzu8 > div.css-mticar').html() + $('#new-article-template > div > div.css-wvfzu8 > div > div > section').html();
        const categories = nextData.keywords.map((k) => k);

        return { article, categories };
    });

module.exports = async (ctx) => {
    const endpoint = ctx.params.endpoint;
    const feed = await parser.parseURL(`https://www.economist.com/${endpoint}/rss.xml`);

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const itemDetails = await getArticleDetail(item.link, ctx);
            return {
                title: item.title,
                description: itemDetails.article,
                link: item.link,
                guid: item.guid,
                pubDate: item.pubDate,
                category: itemDetails.categories,
            };
        })
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};
