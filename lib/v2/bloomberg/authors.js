const { asyncPoolAll, parseArticle } = require('./utils');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const { id, slug } = ctx.params;
    const feed = await parser.parseURL(`https://www.bloomberg.com/authors/${id}/${slug}.rss`);
    const item = await asyncPoolAll(1, feed.items, (item) => parseArticle(item, ctx));
    ctx.state.data = {
        title: `Bloomberg - ${feed.title.split(' - ', 2)[0]}`,
        link: feed.link,
        language: feed.language,
        item,
    };
};
