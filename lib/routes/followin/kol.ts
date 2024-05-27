import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { baseUrl, getBuildId, parseList, parseItem } from './utils';

export const route: Route = {
    path: '/kol/:kolId/:lang?',
    categories: ['finance'],
    example: '/followin/kol/4075592991',
    parameters: { kolId: 'KOL ID, can be found in URL', lang: 'Language, see table above, `en` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['followin.io/:lang/kol/:kolId', 'followin.io/kol/:kolId'],
        },
    ],
    name: 'KOL',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { kolId, lang = 'en' } = ctx.req.param();
    const { limit = 10 } = ctx.req.query();

    const buildId = await getBuildId(cache.tryGet);
    const { data: response } = await got(`${baseUrl}/_next/data/${buildId}/${lang}/kol/${kolId}.json`);

    const { queries } = response.pageProps.dehydratedState;
    const { data: profile } = queries.find((q) => q.queryKey[0] === '/user/get_profile').state;

    const list = parseList(queries.find((q) => q.queryKey[0] === '/feed/list/user').state.data.pages[0].list.slice(0, limit), lang, buildId);
    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    return {
        title: `${profile.nickname} - Followin`,
        description: profile.bio,
        link: `${baseUrl}/${lang}/kol/${kolId}`,
        image: profile.avatar,
        language: lang,
        item: items,
    };
}
