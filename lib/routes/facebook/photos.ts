import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, fetchCollection, fetchGraphql } from './utils';

export const route: Route = {
    path: '/photos/:id',
    categories: ['social-media'],
    example: '/facebook/photos/NASA',
    parameters: { id: 'Page or profile username' },
    features: {
        requireConfig: [
            {
                name: 'FACEBOOK_COOKIE',
                optional: true,
                description: 'Facebook cookie, only `c_user` and `xs` are required. Set this if you see `Rate limit exceeded`.',
            },
        ],
        antiCrawler: true,
    },
    radar: [
        {
            source: ['www.facebook.com/:id/photos', 'www.facebook.com/:id/photos_by'],
            target: '/photos/:id',
        },
    ],
    name: 'Photos',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.facebook.com',
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const collection = await fetchCollection(id, 'photos', 'photos_by');

    const photos = await fetchGraphql(
        'ProfileCometAppCollectionPhotosRendererPaginationQuery',
        '27028962643386672',
        {
            id: collection.id,
            count: 8,
            scale: 1,
            created_time_start: null,
            created_time_end: null,
            tagged_user_ids: null,
        },
        getRouteLimit(ctx, 24),
        (lines) => lines[0].data.node.pageItems.edges.map((edge) => edge.node)
    );

    return {
        title: collection.name ?? `Facebook Photos ${id}`,
        link: `${baseUrl}/${id}/photos`,
        item: photos.map((item): DataItem => ({
            title: item.node.accessibility_caption ?? `Photo ${item.node.id}`,
            description: `<img src="${item.node.viewer_image.uri}" alt="${item.node.accessibility_caption ?? ''}">`,
            link: item.url,
        })),
    };
}
