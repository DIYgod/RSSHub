import type { RouteHandler } from '@hono/zod-openapi';
import { createRoute, z } from '@hono/zod-openapi';

import { getRadarRules } from './utils';

const ParamsSchema = z.object({
    domain: z.string().openapi({
        param: {
            name: 'domain',
            in: 'path',
        },
        example: 'github.com',
    }),
});

const route = createRoute({
    method: 'get',
    path: '/radar/rules/{domain}',
    description: 'Radar rules for a domain name',
    tags: ['Radar'],
    request: {
        params: ParamsSchema,
    },
    responses: {
        200: {
            description: 'Radar rules for a domain name (no subdomains)',
        },
    },
});

const handler: RouteHandler<typeof route> = async (ctx) => {
    const { domain } = ctx.req.valid('param');
    const rules = await getRadarRules();
    return ctx.json(rules[domain]);
};

export { handler, route };
