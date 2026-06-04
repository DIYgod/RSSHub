import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiBase, baseUrl, getUserInfo, renderLive } from './utils';

export const route: Route = {
    path: '/user/:id/livestream',
    categories: ['multimedia'],
    example: '/otobanana/user/cee16401-96b1-420f-8188-abd4d33093f1/livestream',
    parameters: { id: 'User ID, can be found in URL' },
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
            source: ['otobanana.com/user/:id/livestream', 'otobanana.com/user/:id'],
        },
    ],
    name: 'Livestream ライブ配信',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const userInfo = await getUserInfo(id, cache.tryGet);
    const { data: liveData } = await got(`${apiBase}/users/${id}/livestreams/`);

    const casts = liveData.results.map((item) => renderLive(item));

    ctx.set('json', {
        userInfo,
        liveData,
    });

    return {
        title: `${userInfo.name} (@${userInfo.username}) - ライブ配信 | OTOBANANA`,
        description: userInfo.bio.replaceAll('\n', ' '),
        link: `${baseUrl}/user/${id}`,
        image: userInfo.avatar_url,
        icon: userInfo.avatar_url,
        logo: userInfo.avatar_url,
        language: 'ja',
        author: userInfo.name,
        itunes_author: userInfo.name,
        item: casts,
    };
}
