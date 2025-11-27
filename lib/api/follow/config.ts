import type { RouteHandler } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';

import { config } from '@/config';
import { gitDate, gitHash } from '@/utils/git-hash';

const route = createRoute({
    method: 'get',
    path: '/follow/config',
    tags: ['Follow'],
    responses: {
        200: {
            description: 'Follow config',
        },
    },
});

const handler: RouteHandler<typeof route> = (ctx) =>
    ctx.json({
        ownerUserId: config.follow.ownerUserId,
        description: config.follow.description,
        price: config.follow.price,
        userLimit: config.follow.userLimit,
        cacheTime: config.cache.routeExpire,
        gitHash,
        gitDate: gitDate?.getTime(),
    });

export { handler, route };
