const { getConfig } = require('./utils');
const got = require('@/utils/got');
const RSSParser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const { link, key } = getConfig(ctx);

    const feed = await RSSParser.parseString(
        (
            await got(`${link}/posts.rss`, {
                headers: {
                    'User-Api-Key': key,
                },
            })
        ).data
    );

    feed.items = feed.items.map((e) => ({
        description: e.content,
        author: e.creator,
        ...e,
    }));

    ctx.state.data = { item: feed.items, ...feed };
};
