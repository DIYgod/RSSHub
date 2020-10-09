const matatakiUtils = require('@/utils/matataki-utils');

module.exports = async (ctx) => {

    const id = ctx.params.id;
    const querystring = ctx.request.querystring;

    const tokenName = await matatakiUtils.getTokenName(id);
    const items = await matatakiUtils.getPostIpfsFeedItems(`https://api.smartsignature.io/minetoken/${id}/related?${querystring}`);

    ctx.state.data = {
        title: `瞬Matataki - ${tokenName ? tokenName : 'Fan票'}关联文章`,
        link: matatakiUtils.IPFS_GATEWAY_URL,
        description: `瞬Matataki - ${tokenName ? tokenName : 'Fan票'}关联文章`,
        allowEmpty: true,
        item: items,
    };

};
