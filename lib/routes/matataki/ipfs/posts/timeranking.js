const matatakiUtils = require('@/routes/matataki/utils/matataki-utils');

module.exports = async (ctx) => {

    const querystring = ctx.request.querystring;

    const items = await matatakiUtils.getPostIpfsFeedItems(`https://api.smartsignature.io/posts/timeRanking?${querystring}`);

    ctx.state.data = {
        title: `瞬Matataki - 最新作品(IPFS)`,
        link: matatakiUtils.IPFS_GATEWAY_URL,
        description: `瞬Matataki - 最新作品(IPFS)`,
        item: items,
    };
};
