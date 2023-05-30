const got = require('@/utils/got');
const { baseUrl, favicon, getBuildId, parseList, parseItem } = require('./utils');

module.exports = async (ctx) => {
    const { lang = 'en' } = ctx.params;
    const { limit = 20 } = ctx.query;

    const buildId = await getBuildId(ctx.cache.tryGet);
    const { data: response } = await got(`${baseUrl}/_next/data/${buildId}/${lang}/news.json`);

    const list = parseList(response.pageProps.dehydratedState.queries.find((q) => q.queryKey[0] === '/feed/list/recommended/news').state.data.pages[0].list.slice(0, limit), lang, buildId);
    const items = await Promise.all(list.map((item) => parseItem(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `${lang === 'en' ? 'News' : lang === 'vi' ? 'Bản tin' : '快讯'} - Followin`,
        link: `${baseUrl}/${lang}/news`,
        image: favicon,
        language: lang,
        item: items,
    };
};
