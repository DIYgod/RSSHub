const parser = require('@/utils/rss-parser');
const utils = require('./utils');

module.exports = async (ctx) => {
    let category = ctx.params.category_id;
    if (category === 'article') {
        category = '';
    } // backward compatability
    const rssUrl = category ? `https://www.iyouport.org/category/${category}/atom` : `https://www.iyouport.org/atom`;
    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => ({
                    title: item.title,
                    id: item.guid,
                    pubDate: new Date(item.pubDate).toUTCString(),
                    author: item.creator,
                    link: item.link,
                    description: await utils.ProcessFeed(item.link),
                    category: item.categories,
                    icon: 'https://i2.wp.com/www.iyouport.org/wp-content/uploads/2019/04/cropped-iyouport-2.png',
                }))
        )
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: 'zh-cn',
        icon: 'https://i2.wp.com/www.iyouport.org/wp-content/uploads/2019/04/cropped-iyouport-2.png',
    };
};
