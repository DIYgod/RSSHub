const matatakiUtils = require('@/routes/matataki/utils/matataki-utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const filterCode = ctx.params.filterCode;
    const ipfsFlag = !!ctx.params.ipfsFlag;

    const tokenName = await matatakiUtils.getTokenName(id);
    const items = await matatakiUtils.getPostsAsFeedItems(`/minetoken/${id}/related?filter=${filterCode}&sort=time-desc&onlyCreator=0&page=1`, ipfsFlag);

    ctx.state.data = {
        title: `瞬Matataki - ${tokenName ? tokenName : 'Fan票'}关联作品 ${ipfsFlag ? '(IPFS)' : ''}`,
        link: `https://www.matataki.io/token/${id}/circle`,
        description: `瞬Matataki - ${tokenName ? tokenName : 'Fan票'}关联作品`,
        allowEmpty: true,
        item: items,
    };
};
