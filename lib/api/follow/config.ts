import { config } from '@/config';
import { createRoute, RouteHandler } from '@hono/zod-openapi';

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
        limit: config.follow.limit,
    });

export { route, handler };
