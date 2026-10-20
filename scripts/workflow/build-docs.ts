import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { config } from '../../lib/config';
import { ensureAllLoaded, namespaces } from '../../lib/registry';
import type { Route } from '../../lib/types';
import { getCurrentPath } from '../../lib/utils/helpers';
import { categories } from './data';

interface FoloAnalysis {
    data: Record<string, { subscriptionCount: number; topFeeds: any[] }>;
}

await ensureAllLoaded();

const fullTests = await (await fetch('https://cdn.jsdelivr.net/gh/DIYgod/RSSHub@gh-pages/build/test-full-routes.json')).json();
const testResult = fullTests.testResults[0].assertionResults;

const foloAnalysisResponse = await fetch('https://raw.githubusercontent.com/RSSNext/rsshub-docs/refs/heads/main/rsshub-analytics.json', {
    headers: {
        'user-agent': config.trueUA,
    },
});
const foloAnalysis: FoloAnalysis = await foloAnalysisResponse.json();
const foloAnalysisResult = foloAnalysis.data;
const foloAnalysisTop100 = Object.entries(foloAnalysisResult)
    .toSorted((a, b) => b[1].subscriptionCount - a[1].subscriptionCount)
    .slice(0, 150);

const __dirname = getCurrentPath(import.meta.url);

const git = (...args: string[]) =>
    execFileSync('git', args, {
        cwd: path.join(__dirname, '../..'),
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    });

/**
 * When each file under lib/routes was first committed, followed through renames so that a moved or converted file
 * keeps its date. The /rsshub/routes feed dates its items with this. A shallow clone would date every file to its
 * oldest fetched commit and announce all routes as new, so the full history is required.
 */
const getRouteFileAddedAt = () => {
    if (git('rev-parse', '--is-shallow-repository').trim() === 'true') {
        throw new Error('Dating routes needs the full git history, run `git fetch --unshallow` first');
    }

    const log = git('-c', 'core.quotePath=false', '-c', 'diff.renameLimit=0', 'log', '-M', '--name-status', '--diff-filter=AR', '--format=%x00%cI', '--', 'lib/routes');
    const addedAt = new Map<string, string>();
    // git log lists the newest commit first; replay from the oldest so that a rename hands its date to the new path
    for (const commit of log.split('\0').toReversed()) {
        const [date, ...changes] = commit.split('\n');
        for (const change of changes) {
            const [status, from, to] = change.split('\t', 3);
            if (status === 'A' && !addedAt.has(from)) {
                addedAt.set(from, new Date(date).toISOString());
            } else if (status.startsWith('R')) {
                addedAt.set(to, addedAt.get(from) ?? new Date(date).toISOString());
            }
        }
    }
    return addedAt;
};

const routeFileAddedAt = getRouteFileAddedAt();

// Build namespace-centric data structure
interface NamespaceData {
    name: string;
    url?: string;
    description?: string;
    zh?: {
        name?: string;
        description?: string;
    };
    categories: string[];
    heat: number;
    routes: Record<string, RouteData>;
}

interface RouteData {
    path: string | string[];
    name: string;
    url?: string;
    maintainers: string[];
    example: string;
    parameters?: Route['parameters'];
    description?: string;
    categories?: string[];
    features?: Route['features'];
    radar?: any[];
    view?: number;
    location?: string;
    /** ISO time of the commit that added the route's file */
    addedAt?: string;
    heat: number;
    topFeeds: any[];
    zh?: {
        name?: string;
        description?: string;
        parameters?: Route['parameters'];
    };
    test?: {
        code: number;
        message?: string;
    };
}

const namespacesData: Record<string, NamespaceData> = {};

// First pass: build namespace data with all routes
for (const namespace in namespaces) {
    const nsData = namespaces[namespace];

    // Determine default category
    let defaultCategory = nsData.categories?.[0];
    if (!defaultCategory) {
        for (const routePath in nsData.routes) {
            if (!nsData.routes[routePath].categories) {
                continue;
            }

            defaultCategory = nsData.routes[routePath].categories[0];
            break;
        }
    }
    if (!defaultCategory) {
        defaultCategory = 'other';
    }

    // Collect all categories for this namespace
    const nsCategories = new Set<string>(nsData.categories || []);

    // Initialize namespace data
    namespacesData[namespace] = {
        name: nsData.name === 'Unknown' ? namespace : nsData.name,
        url: nsData.url,
        description: nsData.description,
        zh: nsData.zh
            ? {
                  name: nsData.zh.name,
                  description: nsData.zh.description,
              }
            : undefined,
        categories: [],
        heat: 0,
        routes: {},
    };

    // Process routes
    const processedPaths = new Set<string>();

    for (const routePath in nsData.routes) {
        const realPath = `/${namespace}${routePath}`;
        const routeData = nsData.routes[routePath];

        // Skip duplicate array paths
        if (Array.isArray(routeData.path)) {
            if (processedPaths.has(routeData.path[0])) {
                continue;
            }
            processedPaths.add(routeData.path[0]);
        }

        // Determine route categories
        const routeCategories = routeData.categories || nsData.categories || [defaultCategory];

        // Check if popular
        const isPopular = foloAnalysisTop100.some(([p]) => p === realPath);
        if (isPopular && !routeCategories.includes('popular')) {
            routeCategories.push('popular');
        }

        // Add categories to namespace
        for (const cat of routeCategories) {
            nsCategories.add(cat);
        }

        // Get test result
        const test = testResult.find((t) => t.title === realPath);
        const parsedTest = test
            ? {
                  code: test.status === 'passed' ? 0 : 1,
                  message: test.failureMessages?.[0],
              }
            : undefined;

        const heat = foloAnalysisResult[realPath]?.subscriptionCount || 0;

        // Build route data
        namespacesData[namespace].routes[realPath] = {
            path: routeData.path,
            name: routeData.name,
            url: routeData.url,
            maintainers: routeData.maintainers,
            example: routeData.example,
            parameters: routeData.parameters,
            description: routeData.description,
            categories: routeCategories,
            features: routeData.features,
            radar: routeData.radar,
            view: routeData.view,
            location: routeData.location,
            addedAt: routeFileAddedAt.get(`lib/routes/${namespace}/${routeData.location}`),
            heat,
            topFeeds: foloAnalysisResult[realPath]?.topFeeds || [],
            zh: routeData.zh
                ? {
                      name: routeData.zh.name,
                      description: routeData.zh.description,
                      parameters: routeData.zh.parameters,
                  }
                : undefined,
            test: parsedTest,
        };

        namespacesData[namespace].heat += heat;
    }

    namespacesData[namespace].categories = [...nsCategories];
}

// Generate JSON output
fs.mkdirSync(path.join(__dirname, '../../assets/build/docs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../../assets/build/docs/routes.json'), JSON.stringify(namespacesData, null, 2));

// Generate categories data
const categoriesData = categories.map((cat) => ({
    id: cat.link.replace('/routes/', ''),
    icon: cat.icon,
    en: cat.en,
    zh: cat.zh,
}));
fs.writeFileSync(path.join(__dirname, '../../assets/build/docs/categories.json'), JSON.stringify(categoriesData, null, 2));
