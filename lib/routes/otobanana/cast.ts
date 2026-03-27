import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiBase, baseUrl, getUserInfo, renderCast } from './utils';

export const route: Route = {
    path: '/user/:id/cast',
    categories: ['multimedia'],
    example: '/otobanana/user/cee16401-96b1-420f-8188-abd4d33093f1/cast',
    parameters: { id: 'User ID, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['otobanana.com/user/:id/cast', 'otobanana.com/user/:id'],
        },
    ],
    name: 'Cast 音声投稿',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const userInfo = await getUserInfo(id, cache.tryGet);
    const { data: castData } = await got(`${apiBase}/users/${id}/casts/`);

    const casts = castData.results.map((item) => renderCast(item));

    ctx.set('json', {
        userInfo,
        castData,
    });

    return {
        title: `${userInfo.name} (@${userInfo.username}) - 音声投稿 | OTOBANANA`,
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
