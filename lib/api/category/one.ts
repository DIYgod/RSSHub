import type { RouteHandler } from '@hono/zod-openapi';
import { createRoute, z } from '@hono/zod-openapi';

import { ensureAllLoaded, namespaces } from '@/registry';

let cachedCategoryList: Record<string, typeof namespaces> | undefined;

const getCategoryList = async (): Promise<Record<string, typeof namespaces>> => {
    if (cachedCategoryList) {
        return cachedCategoryList;
    }
    await ensureAllLoaded();

    const list: Record<string, typeof namespaces> = {};
    for (const namespace in namespaces) {
        for (const path in namespaces[namespace].routes) {
            if (!namespaces[namespace].routes[path].categories?.length) {
                continue;
            }
            const categories = namespaces[namespace].routes[path].categories!;
            for (const category of categories) {
                if (!Object.hasOwn(list, category)) {
                    list[category] = {};
                }
                if (!Object.hasOwn(list[category], namespace)) {
                    list[category][namespace] = {
                        ...namespaces[namespace],
                        routes: {},
                    };
                }
                list[category][namespace].routes[path] = namespaces[namespace].routes[path];
            }
        }
    }
    cachedCategoryList = list;
    return cachedCategoryList;
};

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
    description: 'Namespace list filtered by category',
    tags: ['Category'],
    request: {
        query: QuerySchema,
        params: ParamsSchema,
    },
    responses: {
        200: {
            description: 'Namespaces matching the requested category',
        },
    },
});

const handler: RouteHandler<typeof route> = async (ctx) => {
    const categoryList = await getCategoryList();
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

export { handler, route };
