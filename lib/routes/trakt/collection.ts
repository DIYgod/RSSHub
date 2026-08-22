import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/collection/:username',
    categories: ['multimedia'],
    example: '/trakt/collection/sonply',
    parameters: { username: 'Username' },
    radar: [
        {
            source: ['app.trakt.tv/profile/:username'],
            target: '/collection/:username',
        },
    ],
    name: 'User Collection',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx: Context) {
    const { username } = ctx.req.param();
    const limit = Number(ctx.req.query('limit') ?? '10');

    const headers = {
        'trakt-api-key': '201dc70c5ec6af530f12f079ea1922733f6e1085ad7b02f36d8e011b75bcea7d',
        'trakt-api-version': '2',
    };

    const profile = await cache.tryGet(`trakt:user:${username}`, () => ofetch(`https://apiz.trakt.tv/users/${username}?extended=full`, { headers }));

    const response = await ofetch(`https://apiz.trakt.tv/users/${username}/favorites/media`, {
        query: {
            extended: 'full,images',
            sort_by: 'added',
            sort_how: 'desc',
            limit,
        },
        headers,
    });

    return {
        title: `${profile.name}'s favorites - Trakt`,
        description: profile.about,
        image: profile.images.avatar.full,
        link: `https://app.trakt.tv/profile/${username}?mode=media`,
        item: response.map((entry) => {
            const media = entry[entry.type];
            const poster = media.images.poster[0];
            return {
                title: `${media.title} | ${media.original_title} (${media.year})`,
                link: `https://trakt.tv/${entry.type}s/${media.ids.slug}`,
                author: username,
                category: [entry.type, ...media.genres, ...media.subgenres],
                description: `${poster ? `<img src="https://${poster}" style="max-width: 100%;"><br>` : ''}${media.overview ?? ''}`,
                pubDate: parseDate(entry.listed_at),
            };
        }),
    };
}
