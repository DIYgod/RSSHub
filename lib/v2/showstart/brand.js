const { TITLE, HOST } = require('./const');
const { fetchBrandInfo } = require('./service');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const brand = await fetchBrandInfo({
        brandId: id,
    });
    ctx.state.data = {
        title: `${TITLE} - ${brand.name}`,
        description: brand.content,
        link: `${HOST}/host/${brand.id}`,
        item: brand.activityList,
    };
};
