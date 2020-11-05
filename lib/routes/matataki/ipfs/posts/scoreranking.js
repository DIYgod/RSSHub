const matatakiUtils = require('@/routes/matataki/utils/matataki-utils');

module.exports = async (ctx) => {

    const items = await matatakiUtils.getPostIpfsFeedItems(`https://api.smartsignature.io/posts/scoreRanking`);

    ctx.state.data = {
        title: `瞬Matataki - 热门作品(IPFS)`,
        link: matatakiUtils.IPFS_GATEWAY_URL,
        description: `瞬Matataki - 热门作品(IPFS)`,
        item: items,
    };
};
