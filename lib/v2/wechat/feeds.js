const parser = require('@/utils/rss-parser');
const { finishArticleItem } = require('@/utils/wechat-mp');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://github.com/hellodword/wechat-feeds/raw/feeds/${id}.xml`;
    const feed = await parser.parseURL(link);

    const items = feed.items.map((item) => ({
        title: item.title,
        pubDate: new Date(item.pubDate),
        link: item.link,
        guid: item.link,
    }));
    await Promise.all(items.map(async (item) => await finishArticleItem(ctx, item)));

    ctx.state.data = {
        title: feed.title,
        link,
        description: feed.description,
        item: items,
    };
};
