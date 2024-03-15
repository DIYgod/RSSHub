import { namespaces } from '@/registry';
import { parse } from 'tldts';
import { RadarItem } from '@/types';
import { createRoute, RouteHandler } from '@hono/zod-openapi';

const radar: {
    [domain: string]: {
        _name: string;
        [subdomain: string]: RadarItem[] | string;
    };
} = {};

for (const namespace in namespaces) {
    for (const path in namespaces[namespace].routes) {
        const realPath = `/${namespace}${path}`;
        const data = namespaces[namespace].routes[path];
        if (data.radar?.length) {
            for (const radarItem of data.radar) {
                const parsedDomain = parse(new URL('https://' + radarItem.source[0]).hostname);
                const subdomain = parsedDomain.subdomain || '.';
                const domain = parsedDomain.domain;
                if (domain) {
                    if (!radar[domain]) {
                        radar[domain] = {
                            _name: namespaces[namespace].name,
                        };
                    }
                    if (!radar[domain][subdomain]) {
                        radar[domain][subdomain] = [];
                    }
                    radar[domain][subdomain].push({
                        title: radarItem.title || data.name,
                        docs: `https://docs.rsshub.app/routes/${data.categories?.[0] || 'other'}`,
                        source: radarItem.source.map((source) => {
                            const sourceURL = new URL('https://' + source);
                            return sourceURL.pathname + sourceURL.search + sourceURL.hash;
                        }),
                        target: radarItem.target ? `/${namespace}${radarItem.target}` : realPath,
                    });
                }
            }
        }
    }
}

const route = createRoute({
    method: 'get',
    path: '/radar/rules',
    tags: ['Radar'],
    responses: {
        200: {
            description: 'All Radar rules',
        },
    },
});

const handler: RouteHandler<typeof route> = (ctx) => ctx.json(radar);

export { route, handler };
