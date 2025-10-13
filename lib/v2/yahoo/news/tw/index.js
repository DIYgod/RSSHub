const { getArchive, getCategories, parseList, parseItem } = require('./utils');

module.exports = async (ctx) => {
    const { region, category } = ctx.params;
    if (!['hk', 'tw'].includes(region)) {
        throw Error(`Unknown region: ${region}`);
    }

    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 20;
    const categoryMap = await getCategories(region, ctx.cache.tryGet);
    const tag = category ? categoryMap[category].yctMap : null;

    const response = await getArchive(region, limit, tag);
    const list = parseList(region, response);

    const items = await Promise.all(list.map((item) => parseItem(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `Yahoo 新聞 - ${category ? categoryMap[category].name : '所有類別'}`,
        link: `https://${region}.news.yahoo.com/${category ? `${category}/` : ''}archive`,
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
        item: items,
    };
};
