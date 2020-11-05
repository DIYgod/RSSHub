const matatakiUtils = require('@/routes/matataki/utils/matataki-utils');

module.exports = async (ctx) => {

    const authorId = ctx.params.authorId;

    const authorName = await matatakiUtils.getUserNickname(authorId);

    const items = await matatakiUtils.getPostIpfsFeedItems(`https://api.smartsignature.io/posts/timeRanking?author=${authorId}`);

    ctx.state.data = {
        title: `瞬Matataki - ${authorName}作品(IPFS)`,
        link: matatakiUtils.IPFS_GATEWAY_URL,
        description: `瞬Matataki - ${authorName}作品(IPFS)`,
        item: items,
    };
};
