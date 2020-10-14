const matatakiUtils = require('@/utils/matataki-utils');

module.exports = async (ctx) => {

    const tagId = ctx.params.tagId;
    const tagName = ctx.request.query.name;

    const items = await matatakiUtils.getPostIpfsFeedItems(`https://api.smartsignature.io/posts/getPostByTag?pagesize=20&tagid=${tagId}&extra=short_content&orderBy=hot_score&order=desc&page=1`);

    ctx.state.data = {
        title: `瞬Matataki #${tagName} (IPFS)`,
        link:  matatakiUtils.IPFS_GATEWAY_URL,
        description: `瞬Matataki #${tagName}  (IPFS)`,
        item: items,
    };
};
