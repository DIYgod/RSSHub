const utils = require('../utils');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const limit = ctx.params.limit || 50;
    const result = await utils.getTwit().get('search/tweets', {
        q: keyword,
        count: limit,
        tweet_mode: 'extended',
        result_type: 'recent',
    });
    const data = result.data;

    ctx.state.data = {
        title: `Twitter Keyword - ${keyword}`,
        link: `https://twitter.com/search?q=${encodeURIComponent(keyword)}`,
        item: utils.ProcessFeed(ctx, {
            data: data.statuses,
        }),
        allowEmpty: true,
    };
};
