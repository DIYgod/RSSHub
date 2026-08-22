import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchVideos } from './util';

export const route: Route = {
    path: '/tag/:name',
    categories: ['multimedia'],
    example: '/av01/tag/中出し',
    parameters: {
        name: '分类名或 id，仅限日语，可直接在网站上找到',
    },
    name: '分类',
    maintainers: ['CorrectRoadH'],
    handler: (ctx: Context) => fetchVideos(ctx, 'tag', ctx.req.param('name')!),
    features: {
        nsfw: true,
    },
    radar: [
        {
            source: ['www.av01.media/:language/tag/:name/:unusedName', 'www.av01.media/:language/tag/:name'],
        },
    ],
};
