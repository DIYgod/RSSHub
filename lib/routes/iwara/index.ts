import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

import { apiRootUrl, parseThumbnail, rootUrl, typeMap } from './utils';

export const route: Route = {
    path: '/users/:username/:type?',
    example: '/iwara/users/kelpie/video',
    parameters: {
        username: 'username, can find in userpage',
        type: 'content type, can be video or image, default is video',
    },
    name: 'User',
    maintainers: ['Fatpandac'],
    handler,
    features: {
        requirePuppeteer: true,
        nsfw: true,
    },
};

async function handler(ctx) {
    const { username, type = 'video' } = ctx.req.param();

    const profile = await cache.tryGet(`${apiRootUrl}/profile/${username}`, async () => {
        const response = await ofetch(`${apiRootUrl}/profile/${username}`, {
            headers: {
                'user-agent': config.trueUA,
            },
        });
        return response.user;
    });

    const id = profile.id;

    const apiUrl = `${apiRootUrl}/${type === 'video' ? 'videos' : 'images'}?user=${id}`;

    const list = await cache.tryGet(
        apiUrl,
        async () => {
            const { page, destroy } = await getPlaywrightPage(rootUrl, {
                gotoConfig: {
                    waitUntil: 'domcontentloaded',
                },
            });

            try {
                const response = await page.evaluate(async (url) => {
                    const res = await fetch(url);
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                }, apiUrl);

                return response.results;
            } finally {
                await destroy();
            }
        },
        config.cache.routeExpire,
        false
    );

    const items = list.map((item) => ({
        title: item.title,
        author: username,
        link: `${rootUrl}/${type}/${item.id}${item.slug ? `/${item.slug}` : ''}`,
        category: item.tags?.map((i) => i.id) || [],
        description: parseThumbnail(type, item),
        pubDate: parseDate(item.createdAt),
    }));

    return {
        title: `${username}'s iwara - ${typeMap[type]}`,
        link: `${rootUrl}/users/${username}`,
        item: items,
    };
}
