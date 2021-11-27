const utils = require('../utils');
const { getSearch } = require('./twitter-api');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const data = await getSearch(keyword);

    ctx.state.data = {
        title: `Twitter Keyword - ${keyword}`,
        link: `https://twitter.com/search?q=${encodeURIComponent(keyword)}`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
        allowEmpty: true,
    };
};
