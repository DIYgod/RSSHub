const matatakiUtils = require('@/routes/matataki/utils/matataki-utils');

module.exports = async (ctx) => {

    const querystring = ctx.request.querystring;

    const items = await matatakiUtils.getPostFeedItems(`https://api.smartsignature.io/posts/scoreRanking?${querystring}`);

    ctx.state.data = {
        title: `瞬Matataki - 热门作品`,
        link: `https://www.matataki.io/article/`,
        description: `瞬Matataki - 热门作品`,
        item: items
    };
};
