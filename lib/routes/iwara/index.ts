import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { apiRootUrl, parseThumbnail, rootUrl, typeMap } from './utils';

const apiUrlMap = {
    video: `${apiRootUrl}/videos`,
    image: `${apiRootUrl}/images`,
};

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
    const list = await cache.tryGet(
        `${apiUrlMap[type]}?user=${id}`,
        async () => {
            const response = await ofetch(`${apiUrlMap[type]}?user=${id}`, {
                headers: {
                    'user-agent': config.trueUA,
                },
            });
            return response.results;
        },
        config.cache.routeExpire,
        false
    );

    const items = list.map((item) => ({
        title: item.title,
        author: username,
        link: `${rootUrl}/${type}/${item.id}/${item.slug}`,
        category: item.tags.map((i) => i.id),
        description: parseThumbnail(type, item),
        pubDate: parseDate(item.createdAt),
    }));

    return {
        title: `${username}'s iwara - ${typeMap[type]}`,
        link: `${rootUrl}/users/${username}`,
        item: items,
    };
}
