import { namespaces } from '@/registry';
import { createRoute, RouteHandler } from '@hono/zod-openapi';

const route = createRoute({
    method: 'get',
    path: '/namespace',
    tags: ['Namespace'],
    responses: {
        200: {
            description: 'Information about all namespaces',
        },
    },
});

const handler: RouteHandler<typeof route> = (ctx) => ctx.json(namespaces);

export { route, handler };
