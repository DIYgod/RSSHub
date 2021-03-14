const matatakiUtils = require('@/routes/matataki/utils/matataki-utils');

module.exports = async (ctx) => {
    const authorId = ctx.params.authorId;
    const ipfsFlag = !!ctx.params.ipfsFlag;

    const authorName = await matatakiUtils.getUserNickname(authorId);

    const items = await matatakiUtils.getPostsAsFeedItems(`/posts/timeRanking?author=${authorId}`, ipfsFlag);

    ctx.state.data = {
        title: `瞬Matataki - ${authorName}作品 ${ipfsFlag ? '(IPFS)' : ''}`,
        link: `https://www.matataki.io/user/${authorId}`,
        description: `瞬Matataki - ${authorName}作品`,
        item: items,
    };
};
