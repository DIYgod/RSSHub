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

const QuerySchema = z.object({
    categories: z
        .string()
        .transform((val) => val.split(','))
        .optional(),
    lang: z.string().optional(),
});

const route = createRoute({
    method: 'get',
    path: '/category/{category}',
    tags: ['Category'],
    request: {
        query: QuerySchema,
        params: ParamsSchema,
    },
    responses: {
        200: {
            description: 'Namespace list by categories and language',
        },
    },
});

const handler: RouteHandler<typeof route> = (ctx) => {
    const { categories, lang } = ctx.req.valid('query');
    const { category } = ctx.req.valid('param');

    let allCategories = [category];
    if (categories && categories.length > 0) {
        allCategories = [...allCategories, ...categories];
    }

    // Get namespaces that exist in all requested categories
    const commonNamespaces = Object.keys(categoryList[category] || {}).filter((namespace) => allCategories.every((cat) => categoryList[cat]?.[namespace]));

    // Create result directly from common namespaces
    let result = Object.fromEntries(commonNamespaces.map((namespace) => [namespace, categoryList[category][namespace]]));

    // Filter by language if provided
    if (lang) {
        result = Object.fromEntries(Object.entries(result).filter(([, value]) => value.lang === lang));
    }

    return ctx.json(result);
};

export { route, handler };
