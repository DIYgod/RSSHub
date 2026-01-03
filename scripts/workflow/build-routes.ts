import fs from 'node:fs';
import path from 'node:path';

import { parse } from 'tldts';
import toSource from 'tosource';

import type { RadarItem } from '../../lib/types';
import { getCurrentPath } from '../../lib/utils/helpers';

const __dirname = getCurrentPath(import.meta.url);

// Check if building for Worker environment
const isWorkerBuild = process.env.WORKER_BUILD === 'true';

// Ignore Redis and remote config in route generation to avoid side effects.
process.env.REDIS_URL = '';
process.env.CACHE_TYPE = '';
process.env.REMOTE_CONFIG = '';

const [{ config }, { namespaces }] = await Promise.all([import('../../lib/config'), import('../../lib/registry')]);

type FoloAnalysis = Record<string, { subscriptionCount: number; topFeeds: any[] }>;

const loadFoloAnalysis = async (): Promise<FoloAnalysis> => {
    try {
        const response = await fetch('https://raw.githubusercontent.com/RSSNext/rsshub-docs/refs/heads/main/rsshub-analytics.json', {
            headers: {
                'user-agent': config.trueUA,
            },
        });

        if (!response.ok) {
            throw new Error(`Unexpected status ${response.status}`);
        }

        const data = await response.json();
        return (data?.data as FoloAnalysis) || {};
    } catch (error) {
        process.emitWarning(`Failed to fetch rsshub-analytics.json, continuing without popularity data. ${String(error)}`);
        return {};
    }
};

const foloAnalysisResult = await loadFoloAnalysis();
const foloAnalysisTop100 = Object.entries(foloAnalysisResult)
    .toSorted((a, b) => b[1].subscriptionCount - a[1].subscriptionCount)
    .slice(0, 150);

// Extract unique namespaces from top 150 routes for Worker build
const workerNamespaces = new Set(foloAnalysisTop100.map(([routePath]) => routePath.split('/')[1]).filter(Boolean));
// Always include test namespace for testing
workerNamespaces.add('test');

const maintainers: Record<string, string[]> = {};
const radar: {
    [domain: string]: {
        _name: string;
        [subdomain: string]: RadarItem[] | string;
    };
} = {};

// Generate route paths type
const allRoutePaths = new Set<string>();

// Filter namespaces for Worker build
const namespacesToProcess = isWorkerBuild ? Object.fromEntries(Object.entries(namespaces).filter(([key]) => workerNamespaces.has(key))) : namespaces;

for (const namespace in namespacesToProcess) {
    const namespaceData = namespacesToProcess[namespace];
    let defaultCategory = namespaceData.categories?.[0];
    if (!defaultCategory) {
        for (const path in namespaceData.routes) {
            if (namespaceData.routes[path].categories) {
                defaultCategory = namespaceData.routes[path].categories[0];
                break;
            }
        }
    }
    if (!defaultCategory) {
        defaultCategory = 'other';
    }
    for (const path in namespaceData.routes) {
        const realPath = `/${namespace}${path}`;
        allRoutePaths.add(realPath);
        const data = namespaceData.routes[path];
        const categories = data.categories || namespaceData.categories || [defaultCategory];
        if (foloAnalysisTop100.some(([path]) => path === realPath)) {
            categories.push('popular');
        }
        // maintainers
        if (data.maintainers) {
            maintainers[realPath] = data.maintainers;
        }
        // radar
        if (data.radar?.length) {
            for (const radarItem of data.radar) {
                const parsedDomain = parse(new URL('https://' + radarItem.source[0]).hostname);
                const subdomain = parsedDomain.subdomain || '.';
                const domain = parsedDomain.domain;
                if (domain) {
                    if (!radar[domain]) {
                        radar[domain] = {
                            _name: namespaceData.name,
                        };
                    }
                    if (!radar[domain][subdomain]) {
                        radar[domain][subdomain] = [];
                    }
                    radar[domain][subdomain].push({
                        title: radarItem.title || data.name,
                        docs: `https://docs.rsshub.app/routes/${categories[0]}`,
                        source: radarItem.source.map((source) => {
                            const sourceURL = new URL('https://' + source);
                            return sourceURL.pathname + sourceURL.search + sourceURL.hash;
                        }),
                        target: radarItem.target ? `/${namespace}${radarItem.target}` : realPath,
                    });
                }
            }
        }
        data.module = `() => import('@/routes/${namespace}/${data.location}')`;
    }
    for (const path in namespaceData.apiRoutes) {
        const data = namespaceData.apiRoutes[path];
        data.module = `() => import('@/routes/${namespace}/${data.location}')`;
    }
}

// Remove duplicates and sort
const uniquePaths = [...allRoutePaths].toSorted();

const routePathsType = `// This file is auto-generated by scripts/workflow/build-routes.ts
// Do not edit manually

export type RoutePath =
${uniquePaths.map((path) => `  | \`${path}\``).join('\n')};
`;

// For Worker build, only output routes-worker.js with filtered namespaces
// For regular build, output all files
if (isWorkerBuild) {
    fs.writeFileSync(path.join(__dirname, '../../assets/build/routes-worker.js'), `export default ${JSON.stringify(namespacesToProcess, null, 2)}`.replaceAll(/"module": "(.*)"\n/g, `"module": $1\n`));
} else {
    fs.writeFileSync(path.join(__dirname, '../../assets/build/radar-rules.json'), JSON.stringify(radar, null, 2));
    fs.writeFileSync(path.join(__dirname, '../../assets/build/radar-rules.js'), `(${toSource(radar)})`);
    fs.writeFileSync(path.join(__dirname, '../../assets/build/maintainers.json'), JSON.stringify(maintainers, null, 2));
    fs.writeFileSync(path.join(__dirname, '../../assets/build/routes.json'), JSON.stringify(namespaces, null, 2));
    fs.writeFileSync(path.join(__dirname, '../../assets/build/routes.js'), `export default ${JSON.stringify(namespaces, null, 2)}`.replaceAll(/"module": "(.*)"\n/g, `"module": $1\n`));
    fs.writeFileSync(path.join(__dirname, '../../assets/build/route-paths.ts'), routePathsType);
}
