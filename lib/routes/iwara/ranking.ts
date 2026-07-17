import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { apiRootUrl, parseThumbnail, rootUrl, typeMap } from './utils';

const sortMap = {
    date: 'Latest',
    trending: 'Trending',
    popularity: 'Popularity',
    views: 'Views',
    likes: 'Likes',
};

const ratingMap = {
    all: 'All',
    general: 'General',
    ecchi: 'Ecchi',
};

export const route: Route = {
    path: '/ranking/:type?/:sort?/:rating?',
    example: '/iwara/ranking/video/date/ecchi',
    parameters: {
        type: 'Content type, can be video or image, default is video',
        sort: 'Sort type, can be date, trending, popularity, views, likes, default is date',
        rating: 'Rating, can be all, general, ecchi, default is ecchi',
    },
    name: 'Ranking',
    maintainers: ['CaoMeiYouRen233'],
    handler,
    features: {
        nsfw: true,
    },
    radar: [
        {
            source: ['www.iwara.tv/videos', 'www.iwara.tv/images'],
            target: (params, url) => {
                const searchParams = new URL(url).searchParams;
                const type = url.includes('/videos') ? 'video' : 'image';
                const sort = searchParams.get('sort') || 'date';
                const rating = searchParams.get('rating') || 'ecchi';
                return `/iwara/ranking/${type}/${sort}/${rating}`;
            },
        },
    ],
};

async function handler(ctx) {
    const { type = 'video', sort = 'date', rating = 'ecchi' } = ctx.req.param();

    const limit = ctx.req.query('limit') || 32;
    const url = `${apiRootUrl}/${type === 'video' ? 'videos' : 'images'}?sort=${sort}&rating=${rating}&limit=${limit}`;

    const items = await cache.tryGet(
        `iwara:ranking:${type}:${sort}:${rating}`,
        async () => {
            const response = await ofetch(url, {
                headers: {
                    'user-agent': config.trueUA,
                },
            });

            return response.results.map((item) => ({
                title: item.title,
                author: item.user.name,
                link: `${rootUrl}/${type === 'video' ? 'video' : 'image'}/${item.id}${item.slug ? `/${item.slug}` : ''}`,
                category: item.tags?.map((i) => i.id) || [],
                description: parseThumbnail(type, item),
                pubDate: parseDate(item.createdAt),
            }));
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `Iwara Ranking - ${typeMap[type]} - ${sortMap[sort]} - ${ratingMap[rating]}`,
        link: `${rootUrl}/${type === 'video' ? 'videos' : 'images'}?sort=${sort}&rating=${rating}`,
        item: items,
    };
}
