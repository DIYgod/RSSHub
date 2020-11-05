const matatakiUtils = require('@/routes/matataki/utils/matataki-utils');

module.exports = async (ctx) => {

    const id = ctx.params.id;
    const filterCode = ctx.params.filterCode;

    const tokenName = await matatakiUtils.getTokenName(id);
    const items = await matatakiUtils.getPostFeedItems(`https://api.smartsignature.io/minetoken/${id}/related?filter=${filterCode}&sort=time-desc&onlyCreator=0&page=1`);

    ctx.state.data = {
        title: `瞬Matataki - ${tokenName ? tokenName : 'Fan票'}关联作品`,
        link: `https://www.matataki.io/token/${id}/circle`,
        description: `瞬Matataki - ${tokenName ? tokenName : 'Fan票'}关联作品`,
        allowEmpty: true,
        item: items,
    };

};
