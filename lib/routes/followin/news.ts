import type { Route } from '@/types';
import { ViewType } from '@/types';

import { baseUrl, favicon, getApi, getPoolSize, processList } from './utils';

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
    const poolSize = getPoolSize(ctx, 20);

    const response = await getApi('/feed/list/recommended/news', lang, { count: poolSize });
    const items = await processList(response.list, lang, ctx, 20);

    return {
        title: `${lang === 'en' ? 'News' : lang === 'vi' ? 'Bản tin' : '快讯'} - Followin`,
        link: `${baseUrl}/${lang}/news`,
        image: favicon,
        language: lang,
        item: items,
    };
}
