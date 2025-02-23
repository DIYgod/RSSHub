import { config } from '@/config';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { gitHash, gitDate } from '@/utils/git-hash';

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

export { route, handler };
