const { getProviderList } = require('./utils');

module.exports = async (ctx) => {
    const { region } = ctx.params;
    if (!['hk', 'tw'].includes(region)) {
        throw new Error(`Unknown region: ${region}`);
    }

    const providerList = await getProviderList(region, ctx.cache.tryGet);

    const items = providerList.map((provider) => ({
        ...provider,
        description: provider.key,
    }));

    ctx.state.data = {
        title: 'Yahoo 新聞 - 新聞來源列表',
        link: `https://${region}.news.yahoo.com`,
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
        item: items,
    };
};
