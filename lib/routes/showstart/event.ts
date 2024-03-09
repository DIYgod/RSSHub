import { TITLE, HOST } from './const';
import { fetchActivityList, fetchDictionary } from './service';

export default async (ctx) => {
    const cityCode = Number.parseInt(ctx.req.param('cityCode'));
    const showStyle = Number.parseInt(ctx.req.param('showStyle'));
    const items = await fetchActivityList({
        cityCode,
        showStyle,
    });
    const { cityName, showName } = await fetchDictionary(cityCode, showStyle);
    const tags = [cityName, showName].filter(Boolean).join(' - ');
    ctx.set('data', {
        title: `${TITLE} - ${tags}`,
        link: HOST,
        item: items,
    });
};
