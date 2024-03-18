import { namespaces } from '@/registry';
import { z, createRoute, RouteHandler } from '@hono/zod-openapi';

const ParamsSchema = z.object({
    namespace: z.string().openapi({
        param: {
            name: 'namespace',
            in: 'path',
        },
        example: 'github',
    }),
});

const route = createRoute({
    method: 'get',
    path: '/namespace/{namespace}',
    tags: ['Namespace'],
    request: {
        params: ParamsSchema,
    },
    responses: {
        200: {
            description: 'Information about a namespace',
        },
    },
});

const handler: RouteHandler<typeof route> = (ctx) => {
    const { namespace } = ctx.req.valid('param');
    return ctx.json(namespaces[namespace]);
};

export { route, handler };
