const utils = require('../utils');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const limit = ctx.query.limit ?? 50;
    const client = await utils.getAppClient();
    const data = await client.v1.get('search/tweets.json', {
        q: keyword,
        count: limit,
        tweet_mode: 'extended',
        result_type: 'recent',
    });

    ctx.state.data = {
        title: `Twitter Keyword - ${keyword}`,
        link: `https://twitter.com/search?q=${encodeURIComponent(keyword)}`,
        item: utils.ProcessFeed(ctx, {
            data: data.statuses,
        }),
        allowEmpty: true,
    };
};
