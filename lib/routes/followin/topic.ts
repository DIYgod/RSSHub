import type { Route } from '@/types';

import { baseUrl, getApi, getPoolSize, processList } from './utils';

export const route: Route = {
    path: '/topic/:topicId/:lang?',
    categories: ['finance'],
    example: '/followin/topic/40',
    parameters: { topicId: 'Topic ID, can be found in URL', lang: 'Language, see table above, `en` by default' },
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
            source: ['followin.io/:lang/topic/:topicId', 'followin.io/topic/:topicId'],
        },
    ],
    name: 'Topic',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { topicId, lang = 'en' } = ctx.req.param();
    const poolSize = getPoolSize(ctx, 20);

    const topicInfo = await getApi('/topic/info', lang, { id: Number(topicId) });
    const response = await getApi('/feed/list/topic', lang, { id: Number(topicId), count: poolSize });
    const items = await processList(response.list, lang, ctx, 20);

    return {
        title: `${topicInfo.title} - Followin`,
        description: topicInfo.desc,
        link: `${baseUrl}/${lang}/topic/${topicId}`,
        image: topicInfo.logo,
        language: lang,
        item: items,
    };
}
