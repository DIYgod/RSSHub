const config = require('@/config').value;
const got = require('@/utils/got');
const RSSParser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    if (!config.discourse || !config.discourse.config) {
        throw 'Discourse RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }
    const { link, key } = config.discourse.config[ctx.params.configId];

    const feed = await RSSParser.parseString(
        (
            await got(`${link}/posts.rss`, {
                headers: {
                    'User-Api-Key': key,
                },
            })
        ).body
    );

    feed.items = feed.items.map((e) => ({
        description: e.content,
        author: e.creator,
        ...e,
    }));

    ctx.state.data = { item: feed.items, ...feed };
};
