const matatakiUtils = require('@/utils/matataki-utils');

module.exports = async (ctx) => {

    const querystring = ctx.request.querystring;

    const items = await matatakiUtils.getPostFeedItems(`https://api.smartsignature.io/posts/timeRanking?${querystring}`);

    ctx.state.data = {
        title: `瞬Matataki - 最新文章`,
        link: `https://www.matataki.io/article/latest`,
        description: `瞬Matataki - 最新文章`,
        item: items,
    };
};
