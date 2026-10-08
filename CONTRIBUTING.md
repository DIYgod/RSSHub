## Please refer to [Join Us](https://docs.rsshub.app/joinus/)

Self-hosted instances can set `REQUEST_RATE_LIMITS='{"www.zhihu.com":{"points":1,"duration":5}}'` to space outgoing requests to specific hostnames. `duration` is measured in seconds; `points` is a positive integer. Matching is exact, so configure API subdomains separately. Limits apply per process or Worker isolate, including proxy requests; multiple replicas need an external shared limiter for a combined limit. Other websites retain their existing behavior.

For private routes on Node.js or Docker, mount a directory of standalone `.mjs` modules and set `USER_ROUTES_PATH` to its path inside the container. Restart RSSHub after edits. Each filename defines a new namespace and must not conflict with built-in routes; TypeScript and repository `@/` aliases are not supported in these standalone modules. Configure normal RSSHub access control for a private instance. Modules are operator-trusted executable code, so keep the directory writable only by the operator.

For example, `/app/routes-user/personal.mjs` can contain:

```js
export const namespace = { name: 'Personal', url: 'example.com' };
export const routes = [
    {
        path: '/news',
        name: 'News',
        maintainers: [],
        handler: async () => {
            const response = await fetch('https://example.com/api/news');
            const articles = await response.json();
            return { title: 'Personal news', link: 'https://example.com', item: articles };
        },
    },
];
```

This registers `/personal/news` and uses the usual RSSHub cache, parameters and feed formats. Existing routes remain available. Workers do not have a runtime filesystem and must include private routes at build time.
