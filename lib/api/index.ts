// import { route as rulesRoute, handler as rulesHandler } from '@/api/radar/rules';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';

import { handler as categoryOneHandler, route as categoryOneRoute } from '@/api/category/one';
import { handler as followConfigHandler, route as followConfigRoute } from '@/api/follow/config';
import { handler as namespaceAllHandler, route as namespaceAllRoute } from '@/api/namespace/all';
import { handler as namespaceOneHandler, route as namespaceOneRoute } from '@/api/namespace/one';
import { handler as radarRulesAllHandler, route as radarRulesAllRoute } from '@/api/radar/rules/all';
import { handler as radarRulesOneHandler, route as radarRulesOneRoute } from '@/api/radar/rules/one';

const app = new OpenAPIHono();

app.openapi(namespaceAllRoute, namespaceAllHandler);
app.openapi(namespaceOneRoute, namespaceOneHandler);
app.openapi(radarRulesAllRoute, radarRulesAllHandler);
app.openapi(radarRulesOneRoute, radarRulesOneHandler);
app.openapi(categoryOneRoute, categoryOneHandler);
app.openapi(followConfigRoute, followConfigHandler);

const docs = app.getOpenAPI31Document({
    openapi: '3.1.0',
    info: {
        version: '0.0.1',
        title: 'RSSHub API',
    },
});
for (const path in docs.paths) {
    docs.paths[`/api${path}`] = docs.paths[path];
    delete docs.paths[path];
}
app.get('/openapi.json', (ctx) => ctx.json(docs));
app.get('/reference', Scalar({ content: docs }));

export default app;
