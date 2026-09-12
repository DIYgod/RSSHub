import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import type { Page } from '@/utils/playwright';

import { apiRootUrl, fetchJsonInPage, getIwaraPage, parseThumbnail, rootUrl, typeMap } from './utils';

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

    let page: Page | undefined;
    let destroy: (() => Promise<void>) | undefined;

    const openPageIfNeeded = async (): Promise<Page> => {
        if (!page || !destroy) {
            const opened = await getIwaraPage();
            page = opened.page;
            destroy = opened.destroy;
        }
        return page;
    };

    try {
        const profile = await cache.tryGet(`${apiRootUrl}/profile/${username}`, async () => {
            const currentPage = await openPageIfNeeded();
            const response = await fetchJsonInPage(currentPage, `${apiRootUrl}/profile/${username}`);

            return response.user;
        });

        const id = profile.id;

        const apiUrl = `${apiRootUrl}/${type === 'video' ? 'videos' : 'images'}?user=${id}`;

        const list = await cache.tryGet(
            apiUrl,
            async () => {
                const currentPage = await openPageIfNeeded();
                const response = await fetchJsonInPage(currentPage, apiUrl);

                return response.results;
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
    } finally {
        if (destroy) {
            await destroy();
        }
    }
}
