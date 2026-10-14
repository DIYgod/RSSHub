import type { Route } from '@/types';

import { baseUrl, getApi, getPoolSize, processList } from './utils';

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
    const poolSize = getPoolSize(ctx, 10);

    const profile = await getApi('/user/get_profile', lang, { id: Number(kolId) });
    const response = await getApi('/feed/list/user', lang, { id: Number(kolId), count: poolSize });
    const items = await processList(response.list, lang, ctx, 10);

    return {
        title: `${profile.nickname} - Followin`,
        description: profile.bio,
        link: `${baseUrl}/${lang}/kol/${kolId}`,
        image: profile.avatar,
        language: lang,
        item: items,
    };
}
