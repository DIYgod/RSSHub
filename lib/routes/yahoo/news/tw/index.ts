// @ts-nocheck
import cache from '@/utils/cache';
const { getArchive, getCategories, parseList, parseItem } = require('./utils');

export default async (ctx) => {
    const { region, category } = ctx.req.param();
    if (!['hk', 'tw'].includes(region)) {
        throw new Error(`Unknown region: ${region}`);
    }

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    const categoryMap = await getCategories(region, cache.tryGet);
    const tag = category ? categoryMap[category].yctMap : null;

    const response = await getArchive(region, limit, tag);
    const list = parseList(region, response);

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    ctx.set('data', {
        title: `Yahoo 新聞 - ${category ? categoryMap[category].name : '所有類別'}`,
        link: `https://${region}.news.yahoo.com/${category ? `${category}/` : ''}archive`,
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
        item: items,
    });
};
