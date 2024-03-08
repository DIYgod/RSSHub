import { TITLE, HOST } from './const';
import { fetchBrandInfo } from './service';

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
