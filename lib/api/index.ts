// import { route as rulesRoute, handler as rulesHandler } from '@/api/radar/rules';
import { route as namespaceAllRoute, handler as namespaceAllHandler } from '@/api/namespace/all';
import { route as namespaceOneRoute, handler as namespaceOneHandler } from '@/api/namespace/one';
import { route as radarRulesAllRoute, handler as radarRulesAllHandler } from '@/api/radar/rules/all';
import { route as radarRulesOneRoute, handler as radarRulesOneHandler } from '@/api/radar/rules/one';
import { route as categoryOneRoute, handler as categoryOneHandler } from '@/api/category/one';
import { route as followConfigRoute, handler as followConfigHandler } from '@/api/follow/config';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';

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
