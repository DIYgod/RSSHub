// @ts-nocheck
const { TITLE, HOST } = require('./const');
const { fetchBrandInfo } = require('./service');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const brand = await fetchBrandInfo({
        brandId: id,
    });
    ctx.set('data', {
        title: `${TITLE} - ${brand.name}`,
        description: brand.content,
        link: `${HOST}/host/${brand.id}`,
        item: brand.activityList,
    });
};
