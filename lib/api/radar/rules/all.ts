import type { RouteHandler } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';

import { getRadarRules } from './utils';

const route = createRoute({
    method: 'get',
    path: '/radar/rules',
    description: 'All Radar rules grouped by domain',
    tags: ['Radar'],
    responses: {
        200: {
            description: 'Radar rules grouped by domain',
        },
    },
});

const handler: RouteHandler<typeof route> = async (ctx) => {
    const rules = await getRadarRules();
    return ctx.json(rules);
};

export { handler, route };
