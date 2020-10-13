const matatakiUtils = require('@/utils/matataki-utils');

module.exports = async (ctx) => {

    const id = ctx.params.id;
    const filterCode = ctx.params.filterCode;

    const tokenName = await matatakiUtils.getTokenName(id);
    const items = await matatakiUtils.getPostIpfsFeedItems(`https://api.smartsignature.io/minetoken/${id}/related?filter=${filterCode}&sort=time-desc&onlyCreator=0&page=1`);

    ctx.state.data = {
        title: `瞬Matataki - ${tokenName ? tokenName : 'Fan票'}关联文章(IPFS)`,
        link: matatakiUtils.IPFS_GATEWAY_URL,
        description: `瞬Matataki - ${tokenName ? tokenName : 'Fan票'}关联文章(IPFS)`,
        allowEmpty: true,
        item: items,
    };

};
