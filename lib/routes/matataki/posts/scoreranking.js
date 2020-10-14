const matatakiUtils = require('@/utils/matataki-utils');

module.exports = async (ctx) => {

    const items = await matatakiUtils.getPostFeedItems(`https://api.smartsignature.io/posts/scoreRanking`);

    ctx.state.data = {
        title: `瞬Matataki - 热门作品`,
        link: `https://www.matataki.io/article/`,
        description: `瞬Matataki - 热门作品`,
        item: items
    };
};
