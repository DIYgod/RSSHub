import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

const rootUrl = 'https://www.iwara.tv';
const apiRootUrl = 'https://api.iwara.tv';
const imageRootUrl = 'https://i.iwara.tv';

const typeMap = {
    video: 'Videos',
    image: 'Images',
};

const apiUrlMap = {
    video: `${apiRootUrl}/videos`,
    image: `${apiRootUrl}/images`,
};

const parseThumbnail = (type, item) => {
    if (type === 'image') {
        return `<img src="${imageRootUrl}/image/original/${item.thumbnail.id}/${item.thumbnail.name}">`;
    }

    if (item.embedUrl === null) {
        return `<img src="${imageRootUrl}/image/original/${item.file.id}/thumbnail-${String(item.thumbnail).padStart(2, '0')}.jpg">`;
    }

    // regex borrowed from https://stackoverflow.com/a/3726073
    const match = /https?:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w-]*)(&(amp;)?[\w=?]*)?/.exec(item.embedUrl);
    if (match) {
        return `<img src="${imageRootUrl}/image/embed/original/youtube/${match[1]}">`;
    }

    return '';
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
