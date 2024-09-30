import { namespaces } from '@/registry';
import { z, createRoute, RouteHandler } from '@hono/zod-openapi';

const categoryList: Record<string, typeof namespaces> = {};

for (const namespace in namespaces) {
    for (const path in namespaces[namespace].routes) {
        if (namespaces[namespace].routes[path].categories?.length) {
            for (const category of namespaces[namespace].routes[path].categories!) {
                if (!categoryList[category]) {
                    categoryList[category] = {};
                }
                if (!categoryList[category][namespace]) {
                    categoryList[category][namespace] = {
                        ...namespaces[namespace],
                        routes: {},
                    };
                }
                categoryList[category][namespace].routes[path] = namespaces[namespace].routes[path];
            }
        }
    }
}

const ParamsSchema = z.object({
    category: z.string().openapi({
        param: {
            name: 'category',
            in: 'path',
        },
        example: 'popular',
    }),
});

const route = createRoute({
    method: 'get',
    path: '/category/{category}',
    tags: ['Category'],
    request: {
        params: ParamsSchema,
    },
    responses: {
        200: {
            description: 'Namespace list by category',
        },
    },
});

const handler: RouteHandler<typeof route> = (ctx) => {
    const { category } = ctx.req.valid('param');
    return ctx.json(categoryList[category]);
};

export { route, handler };
