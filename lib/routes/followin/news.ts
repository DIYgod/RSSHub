import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { baseUrl, favicon, getBuildId, parseItem, parseList } from './utils';

export const route: Route = {
    path: '/news/:lang?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/followin/news',
    parameters: {
        lang: {
            description: 'Language',
            options: [
                { value: 'en', label: 'English' },
                { value: 'zh-Hans', label: '简体中文' },
                { value: 'zh-Hant', label: '繁體中文' },
                { value: 'vi', label: 'Tiếng Việt' },
            ],
            default: 'en',
        },
    },
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
            source: ['followin.io/:lang?/news', 'followin.io/news'],
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { lang = 'en' } = ctx.req.param();
    const { limit = 20 } = ctx.req.query();

    const buildId = await getBuildId(cache.tryGet);
    const { data: response } = await got(`${baseUrl}/_next/data/${buildId}/${lang}/news.json`);

    const list = parseList(response.pageProps.dehydratedState.queries.find((q) => q.queryKey[0] === '/feed/list/recommended/news').state.data.pages[0].list.slice(0, limit), lang, buildId);
    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    return {
        title: `${lang === 'en' ? 'News' : lang === 'vi' ? 'Bản tin' : '快讯'} - Followin`,
        link: `${baseUrl}/${lang}/news`,
        image: favicon,
        language: lang,
        item: items,
    };
}
