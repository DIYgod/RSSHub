import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { apiRootUrl, parseCreatedAt, parseThumbnail, rootUrl, typeMap } from './utils';

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
        requirePuppeteer: false,
        nsfw: true,
    },
    radar: [
        {
            title: 'Videos (Latest, Ecchi)',
            source: ['www.iwara.tv/videos'],
            target: '/ranking/video',
        },
        {
            title: 'Images (Latest, Ecchi)',
            source: ['www.iwara.tv/images'],
            target: '/ranking/image',
        },
    ],
};

async function handler(ctx) {
    const { type = 'video', sort = 'date', rating = 'ecchi' } = ctx.req.param();
    if (!Object.hasOwn(typeMap, type) || !Object.hasOwn(sortMap, sort) || !Object.hasOwn(ratingMap, rating)) {
        throw new InvalidParameterError('Invalid ranking parameters. See the documented content types, sort options, and ratings.');
    }

    const limit = getRouteLimit(ctx, 32);
    const url = `${apiRootUrl}/${type === 'video' ? 'videos' : 'images'}?sort=${sort}&rating=${rating}&limit=${limit}`;

    const items = await cache.tryGet(
        `iwara:ranking:${type}:${sort}:${rating}:${limit}`,
        async () => {
            const response = await ofetch(url);

            return response.results.map((item) => ({
                title: item.title,
                author: item.user.name,
                link: `${rootUrl}/${type === 'video' ? 'video' : 'image'}/${item.id}${item.slug ? `/${item.slug}` : ''}`,
                category: item.tags?.map((i) => i.id) || [],
                description: parseThumbnail(type, item),
                pubDate: parseCreatedAt(item.createdAt),
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
