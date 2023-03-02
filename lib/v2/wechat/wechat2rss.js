const parser = require('@/utils/rss-parser');
const { parseDate } = require('@/utils/parse-date');
const { finishArticleItem } = require('@/utils/wechat-mp');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const baseUrl = 'https://wechat2rss.xlab.app';
    const feedUrl = `${baseUrl}/feed/${id}.xml`;

    const { title, link, description, image, items: item } = await parser.parseURL(feedUrl);

    let items = item.map((i) => ({
        title: i.title,
        pubDate: parseDate(i.pubDate),
        link: i.link,
    }));

    items = await Promise.all(items.map((item) => finishArticleItem(ctx, item)));

    ctx.state.data = {
        title,
        link,
        description,
        image: image.url,
        item: items,
    };
};
