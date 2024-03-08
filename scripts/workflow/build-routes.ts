import { namespaces } from '../../lib/registry';
import { parse } from 'tldts';
import fs from 'node:fs';
import * as path from 'node:path';

const maintainers: Record<string, string[]> = {};
const radar: {
    [domain: string]: {
        _name: string;
        [subdomain: string]:
            | {
                  title: string;
                  docs: string;
                  source: string[];
                  target: string | ((params: any, url: string) => string);
              }[]
            | string;
    };
} = {};

for (const namespace in namespaces) {
    for (const path in namespaces[namespace].routes) {
        const realPath = `/${namespace}${path}`;
        const data = namespaces[namespace].routes[path];
        if (data.maintainers) {
            maintainers[realPath] = data.maintainers;
        }
        if (data.radar && data.radar.source) {
            const parsedDomain = parse(new URL('https://' + data.radar.source[0]).hostname);
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
                    title: data.name,
                    docs: `https://docs.rsshub.app/routes/${data.categories[0] || 'other'}`,
                    source: data.radar.source.map((source) => {
                        const sourceURL = new URL('https://' + source);
                        return sourceURL.pathname + sourceURL.search + sourceURL.hash;
                    }),
                    target: data.radar.target || realPath,
                });
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, '../../assets/build/radar-rules.json'), JSON.stringify(radar, null, 2));
fs.writeFileSync(path.join(__dirname, '../../assets/build/maintainers.json'), JSON.stringify(maintainers, null, 2));
fs.writeFileSync(path.join(__dirname, '../../assets/build/routes.json'), JSON.stringify(namespaces, null, 2));
