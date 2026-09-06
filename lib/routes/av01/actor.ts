import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchVideos } from './util';

export const route: Route = {
    path: '/actor/:name',
    categories: ['multimedia'],
    example: '/av01/actor/七沢みあ',
    parameters: {
        name: '女优名或 id，仅限日语，可直接在网站上找到',
    },
    name: '演员',
    maintainers: ['CorrectRoadH'],
    handler: (ctx: Context) => fetchVideos(ctx, 'actress', ctx.req.param('name')!),
    features: {
        nsfw: true,
    },
    radar: [
        {
            source: ['www.av01.media/:language/actress/:name/:unusedName', 'www.av01.media/:language/actress/:name'],
        },
    ],
};
