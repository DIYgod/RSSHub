const got = require('@/utils/got');
const { apiUrl, favicon, getBParam, getBuildId, getGToken, parseList, parseItem } = require('./utils');

module.exports = async (ctx) => {
    const { categoryId = '1', lang = 'en' } = ctx.params;
    const { limit = 20 } = ctx.query;
    const gToken = await getGToken(ctx.cache.tryGet);
    const bParam = getBParam(lang);

    const { data: response } = await got.post(`${apiUrl}/feed/list/recommended`, {
        headers: {
            'x-bparam': JSON.stringify(bParam),
            'x-gtoken': gToken,
        },
        json: {
            category_id: parseInt(categoryId),
            count: parseInt(limit),
        },
    });
    if (response.code !== 2000) {
        throw Error(response.msg);
    }

    const buildId = await getBuildId(ctx.cache.tryGet);

    const list = parseList(response.data.list, lang, buildId);
    const items = await Promise.all(list.map((item) => parseItem(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: 'Followin',
        link: 'https://followin.io',
        image: favicon,
        item: items,
    };
};
