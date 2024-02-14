const { getArchive, getProviderList, parseList, parseItem } = require('./utils');

module.exports = async (ctx) => {
    const { region, providerId } = ctx.params;
    if (!['hk', 'tw'].includes(region)) {
        throw new Error(`Unknown region: ${region}`);
    }

    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 20;
    const providerList = await getProviderList(region, ctx.cache.tryGet);
    const provider = providerList.find((p) => p.key === providerId);

    const response = await getArchive(region, limit, null, providerId);
    const list = parseList(region, response);

    const items = await Promise.all(list.map((item) => parseItem(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `Yahoo 新聞 - ${provider?.title ?? ''}`,
        link: provider?.link ?? `https://${region}.news.yahoo.com`,
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
        item: items,
    };
};
