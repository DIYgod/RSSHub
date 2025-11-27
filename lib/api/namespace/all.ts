import type { RouteHandler } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';

import { namespaces } from '@/registry';

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

export { handler, route };
