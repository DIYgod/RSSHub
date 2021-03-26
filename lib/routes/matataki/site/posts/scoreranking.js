const matatakiUtils = require('@/routes/matataki/utils/matataki-utils');

module.exports = async (ctx) => {
    const querystring = ctx.request.querystring;
    const ipfsFlag = !!ctx.params.ipfsFlag;

    const items = await matatakiUtils.getPostsAsFeedItems(`/posts/scoreRanking?${querystring}`, ipfsFlag);

    ctx.state.data = {
        title: `瞬Matataki - 热门作品 ${ipfsFlag ? '(IPFS)' : ''}`,
        link: `https://www.matataki.io/article/`,
        description: `瞬Matataki - 热门作品`,
        item: items,
    };
};
