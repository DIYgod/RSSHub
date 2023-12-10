const got = require('@/utils/got');
const { apiUrl, baseUrl, getBParam, getBuildId, getGToken, parseList, parseItem } = require('./utils');

module.exports = async (ctx) => {
    const { tagId, lang = 'en' } = ctx.params;
    const { limit = 20 } = ctx.query;

    const buildId = await getBuildId(ctx.cache.tryGet);
    const tagInfo = await ctx.cache.tryGet(`followin:tag:${tagId}:${lang}`, async () => {
        const { data: response } = await got(`${baseUrl}/_next/data/${buildId}/${lang}/tag/${tagId}.json`);
        const { queries } = response.pageProps.dehydratedState;
        const { base_info: tagInfo } = queries.find((q) => q.queryKey[0] === '/tag/info/v2').state.data;
        return tagInfo;
    });

    const gToken = await getGToken(ctx.cache.tryGet);
    const bParam = getBParam(lang);
    const { data: tagResponse } = await got.post(`${apiUrl}/feed/list/tag`, {
        headers: {
            'x-bparam': JSON.stringify(bParam),
            'x-gtoken': gToken,
        },
        json: {
            count: limit,
            id: parseInt(tagId),
            type: 'tag_discussion_feed',
        },
    });
    if (tagResponse.code !== 2000) {
        throw Error(tagResponse.msg);
    }

    const list = parseList(tagResponse.data.list.slice(0, limit), lang, buildId);
    const items = await Promise.all(list.map((item) => parseItem(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `${tagInfo.name} - Followin`,
        description: tagInfo.description,
        link: `${baseUrl}/${lang}/tag/${tagId}`,
        image: tagInfo.logo,
        language: lang,
        item: items,
    };
};
