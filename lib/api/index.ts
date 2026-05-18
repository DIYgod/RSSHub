// import { route as rulesRoute, handler as rulesHandler } from '@/api/radar/rules';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';

import { handler as categoryOneHandler, route as categoryOneRoute } from '@/api/category/one';
import { handler as followConfigHandler, route as followConfigRoute } from '@/api/follow/config';
import { handler as namespaceAllHandler, route as namespaceAllRoute } from '@/api/namespace/all';
import { handler as namespaceOneHandler, route as namespaceOneRoute } from '@/api/namespace/one';
import { handler as radarRulesAllHandler, route as radarRulesAllRoute } from '@/api/radar/rules/all';
import { handler as radarRulesOneHandler, route as radarRulesOneRoute } from '@/api/radar/rules/one';
import { handler as routeStatusHandler, route as routeStatusRoute } from '@/api/route/status';

const app = new OpenAPIHono();

app.openapi(namespaceAllRoute, namespaceAllHandler);
app.openapi(namespaceOneRoute, namespaceOneHandler);
app.openapi(radarRulesAllRoute, radarRulesAllHandler);
app.openapi(radarRulesOneRoute, radarRulesOneHandler);
app.openapi(categoryOneRoute, categoryOneHandler);
app.openapi(routeStatusRoute, routeStatusHandler);
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
app.get(
    '/reference',
    Scalar({
        content: docs,
        hiddenClients: {
            c: true,
            clojure: true,
            csharp: true,
            dart: true,
            fsharp: true,
            go: false,
            http: true,
            java: true,
            js: true,
            kotlin: true,
            node: ['axios'], // allow fetch, ofetch, undici
            objc: true,
            ocaml: true,
            php: false,
            powershell: true,
            python: false,
            r: true,
            ruby: true,
            rust: true,
            shell: ['httpie', 'wget'], // allow curl
            swift: true,
        },
    })
);

export default app;
