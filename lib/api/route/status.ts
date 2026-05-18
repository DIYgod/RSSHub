import type { RouteHandler } from '@hono/zod-openapi';
import { createRoute, z } from '@hono/zod-openapi';
import xxhash from 'xxhash-wasm';

import cacheModule from '@/utils/cache/index';

const QuerySchema = z.object({
    requestPath: z.string().openapi({
        param: {
            name: 'requestPath',
            in: 'query',
        },
        example: '/github/comments/DIYgod/RSSHub/20768',
        description: 'The route path to check cache status for',
    }),
});

const ResponseSchema = z.object({
    cached: z.boolean(),
    lastBuildDate: z.string().nullable(),
});

const route = createRoute({
    method: 'get',
    path: '/route/status',
    description: 'Check if a route path is cached',
    tags: ['Route'],
    request: {
        query: QuerySchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: ResponseSchema,
                },
            },
            description: 'Cache found',
        },
        404: {
            content: {
                'application/json': {
                    schema: ResponseSchema,
                },
            },
            description: 'Cache not found',
        },
        503: {
            content: {
                'application/json': {
                    schema: ResponseSchema,
                },
            },
            description: 'Cache module unavailable',
        },
    },
});

const handler: RouteHandler<typeof route> = async (ctx) => {
    if (!cacheModule.status.available) {
        return ctx.json({ cached: false, lastBuildDate: null }, 503);
    }

    const { requestPath } = ctx.req.valid('query');
    const { h64ToString } = await xxhash();
    const key = 'rsshub:koa-redis-cache:' + h64ToString(requestPath + ':rss');
    const cached = await cacheModule.globalCache.has(key);

    if (!cached) {
        return ctx.json({ cached: false, lastBuildDate: null }, 404);
    }

    let lastBuildDate: string | null = null;

    try {
        const cachedData = await cacheModule.globalCache.get(key);
        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            lastBuildDate = parsed.lastBuildDate || null;
        }
    } catch {
        //
    }

    return ctx.json({ cached, lastBuildDate }, 200);
};

export { handler, route };
