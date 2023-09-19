const { parseDate } = require('@/utils/parse-date');
const parser = require('@/utils/rss-parser');

const { rootUrl, rootRSSUrl, title, categories, getInfo, processItems } = require('./util');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 100;

    const queryString = id ? `?cid=${id}` : '';
    const currentUrl = new URL(id ? `newsclass.aspx${queryString}` : '', rootUrl).href;

    const rssUrl = new URL(`rss.aspx${queryString}`, rootRSSUrl).href;

    const feed = await parser.parseURL(rssUrl);

    let items = feed.items.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.link,
        description: item.content,
        author: item.creator,
        category: item.categories,
        guid: item.guid.match(/\/(\d+)\.htm/)[1],
        pubDate: parseDate(item.isoDate),
    }));

    if (id) {
        items = await processItems(items, ctx.cache.tryGet);
    }

    ctx.state.data = {
        ...(await getInfo(currentUrl, ctx.cache.tryGet)),
        ...{
            item: items,
            title: `${title} - ${feed.title.split(/_/).pop() || categories.zhibo}`,
        },
    };
};
