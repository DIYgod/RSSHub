// import { route as rulesRoute, handler as rulesHandler } from '@/api/radar/rules';
import { route as namespaceAllRoute, handler as namespaceAllHandler } from '@/api/namespace/all';
import { route as namespaceOneRoute, handler as namespaceOneHandler } from '@/api/namespace/one';
import { route as radarRulesRoute, handler as radarRulesHandler } from '@/api/radar/rules';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';

const app = new OpenAPIHono();

app.openapi(namespaceAllRoute, namespaceAllHandler);
app.openapi(namespaceOneRoute, namespaceOneHandler);
app.openapi(radarRulesRoute, radarRulesHandler);

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
app.get('/docs', (ctx) => ctx.json(docs));

app.get('/ui', swaggerUI({ url: '/api/docs' }));

export default app;
