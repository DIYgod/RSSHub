import type { Route } from '@/types';
import cache from '@/utils/cache';

import { baseUrl, getApi, getPoolSize, processList } from './utils';

export const route: Route = {
    path: '/tag/:tagId/:lang?',
    categories: ['finance'],
    example: '/followin/tag/177008',
    parameters: { tagId: 'Tag ID, can be found in URL', lang: 'Language, see table above, `en` by default' },
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
            source: ['followin.io/:lang/tag/:tagId', 'followin.io/tag/:tagId'],
        },
    ],
    name: 'Tag',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { tagId, lang = 'en' } = ctx.req.param();
    const poolSize = getPoolSize(ctx, 20);

    const tagInfo = await cache.tryGet(`followin:api-tag:${tagId}:${lang}`, async () => {
        const response = await getApi('/tag/info/v2', lang, { id: Number(tagId) });
        return response.base_info;
    });
    const response = await getApi('/feed/list/tag', lang, {
        count: poolSize,
        id: Number(tagId),
        type: 'tag_discussion_feed',
    });
    const items = await processList(response.list, lang, ctx, 20);

    return {
        title: `${tagInfo.name} - Followin`,
        description: tagInfo.description,
        link: `${baseUrl}/${lang}/tag/${tagId}`,
        image: tagInfo.logo,
        language: lang,
        item: items,
    };
}
