import type { RouteHandler } from '@hono/zod-openapi';
import { createRoute, z } from '@hono/zod-openapi';

import { ensureAllLoaded, namespaces } from '@/registry';

const pathParam = (name: string, example: string) =>
    z.string().openapi({
        param: {
            name,
            in: 'path',
        },
        example,
    });

const nestedExample = Object.keys(namespaces)
    .find((key) => key.includes('/'))
    ?.split('/') ?? ['namespace', 'sub'];

const route = createRoute({
    method: 'get',
    path: '/namespace/{namespace}',
    description: 'Information about a namespace',
    tags: ['Namespace'],
    request: {
        params: z.object({ namespace: pathParam('namespace', 'github') }),
    },
    responses: {
        200: {
            description: 'Namespace registry data for a namespace',
        },
    },
});

const routeNested = createRoute({
    method: 'get',
    path: '/namespace/{namespace}/{sub}',
    description: `Information about a nested namespace (e.g. ${nestedExample.join('/')})`,
    tags: ['Namespace'],
    request: {
        params: z.object({ namespace: pathParam('namespace', nestedExample[0]), sub: pathParam('sub', nestedExample[1]) }),
    },
    responses: {
        200: {
            description: 'Namespace registry data for a nested namespace',
        },
    },
});

const handler: RouteHandler<typeof route> = async (ctx) => {
    await ensureAllLoaded();
    const { namespace, sub } = ctx.req.valid('param') as { namespace: string; sub?: string };
    return ctx.json(namespaces[[namespace, sub].filter(Boolean).join('/')]);
};

export { handler, route, routeNested };
