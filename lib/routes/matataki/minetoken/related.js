const matatakiUtils = require('@/utils/matataki-utils');

module.exports = async (ctx) => {

    const id = ctx.params.id;
    const querystring = ctx.request.querystring;

    const tokenName = await matatakiUtils.getTokenName(id);
    const items = await matatakiUtils.getPostFeedItems(`https://api.smartsignature.io/minetoken/${id}/related?${querystring}`);

    ctx.state.data = {
        title: `瞬Matataki - ${tokenName ? tokenName : 'Fan票'}关联文章`,
        link: `https://www.matataki.io/token/${id}/circle`,
        description: `瞬Matataki - ${tokenName ? tokenName : 'Fan票'}关联文章`,
        allowEmpty: true,
        item: items,
    };

};
