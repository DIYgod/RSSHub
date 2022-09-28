const parser = require('@/utils/rss-parser');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const getArticleDetail = async (link, ctx) =>
    await ctx.cache.tryGet(link, async () => {
        const response = await got(link);
        const $ = cheerio.load(response.data);
        $('div.article-audio-player__center-tooltip').remove();
        const nextData = JSON.parse($('head script[type="application/ld+json"]').first().text());

        const article = ($('figure[class^=css-]').first().parent().parent().html() || '') + $('p.article__body-text').parent().html();
        const categories = nextData.keywords?.map((k) => k);

        return { article, categories };
    });

module.exports = async (ctx) => {
    const endpoint = ctx.params.endpoint;
    const feed = await parser.parseURL(`https://www.economist.com/${endpoint}/rss.xml`);

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const path = item.link.slice(item.link.lastIndexOf('/') + 1);
            const isNotCollection = !/^\d{4}-\d{2}-\d{2}$/.test(path);
            const itemDetails = isNotCollection ? await getArticleDetail(item.link, ctx) : null;
            return {
                title: item.title,
                description: isNotCollection ? itemDetails.article : item.content,
                link: item.link,
                guid: item.guid,
                pubDate: item.pubDate,
                category: isNotCollection ? itemDetails.categories : null,
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
