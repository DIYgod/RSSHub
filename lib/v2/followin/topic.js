const got = require('@/utils/got');
const { baseUrl, getBuildId, parseList, parseItem } = require('./utils');

module.exports = async (ctx) => {
    const { topicId, lang = 'en' } = ctx.params;
    const { limit = 20 } = ctx.query;

    const buildId = await getBuildId(ctx.cache.tryGet);
    const { data: response } = await got(`${baseUrl}/_next/data/${buildId}/${lang}/topic/${topicId}.json`);

    const { queries } = response.pageProps.dehydratedState;
    const { data: topicInfo } = queries.find((q) => q.queryKey[0] === '/topic/info').state;

    const list = parseList(queries.find((q) => q.queryKey[0] === '/feed/list/topic').state.data.pages[0].list.slice(0, limit), lang, buildId);
    const items = await Promise.all(list.map((item) => parseItem(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `${topicInfo.title} - Followin`,
        description: topicInfo.desc,
        link: `${baseUrl}/${lang}/topic/${topicId}`,
        image: topicInfo.logo,
        language: lang,
        item: items,
    };
};
