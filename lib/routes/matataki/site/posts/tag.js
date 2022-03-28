const matatakiUtils = require('@/routes/matataki/utils/matataki-utils');

module.exports = async (ctx) => {
    const tagId = ctx.params.tagId;
    const tagName = ctx.params.tagName;
    const ipfsFlag = !!ctx.params.ipfsFlag;

    const items = await matatakiUtils.getPostsAsFeedItems(`/posts/getPostByTag?pagesize=20&tagid=${tagId}&extra=short_content&orderBy=hot_score&order=desc&page=1`, ipfsFlag);

    ctx.state.data = {
        title: `瞬Matataki #${tagName} ${ipfsFlag ? '(IPFS)' : ''}`,
        link: `https://www.matataki.io/tags/${tagId}`,
        description: `瞬Matataki #${tagName}`,
        item: items,
    };
};
