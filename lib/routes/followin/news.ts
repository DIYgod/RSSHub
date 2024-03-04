// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { baseUrl, favicon, getBuildId, parseList, parseItem } = require('./utils');

export default async (ctx) => {
    const { lang = 'en' } = ctx.req.param();
    const { limit = 20 } = ctx.req.query();

    const buildId = await getBuildId(cache.tryGet);
    const { data: response } = await got(`${baseUrl}/_next/data/${buildId}/${lang}/news.json`);

    const list = parseList(response.pageProps.dehydratedState.queries.find((q) => q.queryKey[0] === '/feed/list/recommended/news').state.data.pages[0].list.slice(0, limit), lang, buildId);
    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    ctx.set('data', {
        title: `${lang === 'en' ? 'News' : lang === 'vi' ? 'Bản tin' : '快讯'} - Followin`,
        link: `${baseUrl}/${lang}/news`,
        image: favicon,
        language: lang,
        item: items,
    });
};
